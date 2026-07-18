import { GeminiService } from '../services/geminiService.js';
import {
  retrieveFactsAny,
  checkRuleAny,
  extractMetrics,
} from '../services/knowledgeBase.js';

// Same deterministic backstop idea as the Python backend: if the model
// declined to diagnose but forgot the doctor recommendation, add it
// ourselves in code rather than trusting the prompt alone.
const DIAGNOSIS_DECLINE_MARKERS = [
  "can't diagnose",
  'cannot diagnose',
  'not able to diagnose',
  'unable to diagnose',
  'not a diagnosis',
];
const DOCTOR_DISCLAIMER =
  '\n\n(Please consult a licensed medical professional for an actual diagnosis or before making any treatment decisions.)';

function enforceDoctorDisclaimer(answer) {
  if (!answer) return answer;
  const lower = answer.toLowerCase();
  const declined = DIAGNOSIS_DECLINE_MARKERS.some((m) => lower.includes(m));
  const alreadyRecommends =
    lower.includes('consult') &&
    (lower.includes('doctor') || lower.includes('medical professional') || lower.includes('physician'));
  if (declined && !alreadyRecommends) {
    return answer + DOCTOR_DISCLAIMER;
  }
  return answer;
}

export const analyzeMetrics = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Valid user message parameter required.' });
  }

  try {
    // 1. Real, deterministic retrieval + rule-check (no LLM guessing here)
    const foundMetrics = extractMetrics(message);
    const ruleResults = foundMetrics
      .map((m) => checkRuleAny(m.metric, m.value))
      .filter((r) => !r.reason); // drop "no rule defined" misses

    const matchedFacts = retrieveFactsAny(message, 3);

    // 2. Gemini only narrates this real evidence - it cannot add new facts,
    // sources, or numbers of its own (enforced in the prompt).
    let recommendation = await GeminiService.generateRecommendation(message, {
      facts: matchedFacts,
      ruleResults,
    });
    recommendation = enforceDoctorDisclaimer(recommendation);

    // 3. feature_importance is a REAL normalized score derived from
    // keyword-overlap + rule flags, not something the model invented.
    const importanceItems = [
      ...ruleResults.map((r) => ({
        label: `${r.metric} (${r.value})`,
        weight: r.flag ? 2 : 1, // a triggered rule counts more
      })),
      ...matchedFacts.map((f) => ({
        label: f.entry.topic,
        weight: f.overlap,
      })),
    ];
    const totalWeight = importanceItems.reduce((sum, i) => sum + i.weight, 0) || 1;
    const feature_importance = Object.fromEntries(
      importanceItems.map((i) => [i.label, +(i.weight / totalWeight).toFixed(2)])
    );

    // 4. verifiable_sources come straight from the matched dataset entries -
    // real source names and the actual stored fact text, not an invented quote.
    const verifiable_sources = matchedFacts.map((f) => ({
      source_name: f.entry.source,
      exact_quote: f.entry.fact,
      url: '',
    }));

    return res.status(200).json({
      recommendation,
      feature_importance,
      verifiable_sources,
    });
  } catch (error) {
    console.error('Controller layer caught exception:', error.message);

    return res.status(500).json({
      recommendation:
        'System gateway communication failure. Please verify visual metrics locally.',
      feature_importance: { 'Internal Engine Exception': 1.0 },
      verifiable_sources: [
        {
          source_name: 'MedPulse Local Diagnostics',
          exact_quote: 'Connection timed out. Please review input metrics directly.',
          url: '',
        },
      ],
    });
  }
};
