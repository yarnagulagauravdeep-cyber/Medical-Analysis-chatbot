import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const FILES = {
  wellness: 'wellness.json',
  condition: 'condition.json',
};

function loadDataset(mode) {
  const file = FILES[mode] || FILES.condition;
  const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
  return JSON.parse(raw);
}

/**
 * Real, deterministic keyword-overlap retrieval (no LLM guessing).
 * Returns the facts whose topic/fact text actually overlaps with the
 * user's message, each with a real overlap score used later to build
 * feature_importance from something measured, not simulated.
 */
export function retrieveFacts(mode, query, topK = 3) {
  const dataset = loadDataset(mode);
  const queryWords = new Set(
    query.toLowerCase().split(/\W+/).filter(Boolean)
  );

  const scored = dataset.facts
    .map((entry) => {
      const text = `${entry.topic} ${entry.fact}`.toLowerCase();
      const overlap = [...queryWords].filter((w) => text.includes(w)).length;
      return { entry, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, topK);

  return scored; // [{ entry: {id, topic, fact, source}, overlap: n }, ...]
}

/**
 * Real, deterministic threshold check against the same rules the Python
 * backend uses (BP, BMI, sleep hours, etc.) - not the LLM guessing at
 * medical significance.
 */
export function checkRule(mode, metric, rawValue) {
  const value = parseFloat(rawValue);
  if (Number.isNaN(value)) {
    return { flag: false, reason: `'${rawValue}' is not a valid number for metric '${metric}'` };
  }

  const dataset = loadDataset(mode);
  const rule = dataset.rules[metric];
  if (!rule) {
    return { flag: false, reason: `No rule defined for metric '${metric}'` };
  }

  let triggered = false;
  if (rule.type === 'max' && value > rule.threshold) triggered = true;
  if (rule.type === 'min' && value < rule.threshold) triggered = true;

  return {
    flag: triggered,
    metric,
    value,
    threshold: rule.threshold,
    rule_type: rule.type,
    explanation: rule.explanation,
    source: rule.source,
  };
}

/**
 * The current frontend doesn't send a "mode" field, so these combined
 * variants search across both datasets at once instead of guessing a mode.
 * Real facts/rules either way - just not mode-scoped.
 */
export function retrieveFactsAny(query, topK = 3) {
  const wellness = retrieveFacts('wellness', query, topK);
  const condition = retrieveFacts('condition', query, topK);
  return [...wellness, ...condition]
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, topK);
}

export function checkRuleAny(metric, value) {
  const wellnessResult = checkRule('wellness', metric, value);
  if (!wellnessResult.reason) return wellnessResult; // rule found in wellness
  const conditionResult = checkRule('condition', metric, value);
  if (!conditionResult.reason) return conditionResult; // rule found in condition
  return wellnessResult; // neither had it - return the "no rule defined" message
}

/**
 * Very small, deliberately simple extractor for numeric health metrics
 * mentioned in free text, e.g. "my BP is 150" or "systolic 150/95".
 * Good enough for a demo; not a substitute for structured input fields.
 */
export function extractMetrics(message) {
  const found = [];
  const lower = message.toLowerCase();

  const bp = lower.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (bp) {
    found.push({ metric: 'blood_pressure_systolic', value: bp[1] });
    found.push({ metric: 'blood_pressure_diastolic', value: bp[2] });
  }

  const bmi = lower.match(/bmi\D{0,5}(\d{1,2}(\.\d+)?)/);
  if (bmi) found.push({ metric: 'bmi', value: bmi[1] });

  const sleep = lower.match(/(\d{1,2}(\.\d+)?)\s*(hours|hrs|hr)\b.*sleep|sleep.*?(\d{1,2}(\.\d+)?)\s*(hours|hrs|hr)/);
  if (sleep) found.push({ metric: 'sleep_hours', value: sleep[1] || sleep[4] });

  return found;
}
