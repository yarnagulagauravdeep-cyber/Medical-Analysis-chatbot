import { getAIInstance, rotateApiKey, config } from '../config/gemini.js';

export class GeminiService {
  /**
   * Gemini is only ever asked to write the natural-language recommendation
   * and explain its reasoning USING evidence we already computed in code
   * (real matched facts + real rule-check results). It is explicitly told
   * not to add new facts, sources, quotes, or numbers of its own - those
   * come entirely from evidence.facts / evidence.ruleResults, assembled
   * in the controller. This keeps every claim traceable to something real.
   */
  static async generateRecommendation(userPrompt, evidence, maxAttempts = 5) {
    try {
      const factsBlock = evidence.facts.length
        ? evidence.facts
            .map((f) => `- [${f.entry.id}] (${f.entry.source}): ${f.entry.fact}`)
            .join('\n')
        : 'None found.';

      const ruleBlock = evidence.ruleResults.length
        ? evidence.ruleResults
            .map(
              (r) =>
                `- ${r.metric} = ${r.value} (threshold ${r.rule_type} ${r.threshold}): ` +
                `flag=${r.flag}. ${r.explanation}`
            )
            .join('\n')
        : 'None found.';

      const systemInstruction = `You are a Personalized Health Navigator assistant.

You are given EVIDENCE that was already retrieved/computed by deterministic code -
not by you. You must base your entire answer only on this evidence.

MATCHED FACTS:
${factsBlock}

RULE CHECK RESULTS:
${ruleBlock}

RULES YOU MUST FOLLOW:
- Do NOT invent any additional facts, statistics, thresholds, sources, or quotes.
  Only reference the facts and rule results given above.
- If the evidence above is empty or insufficient to answer, say so honestly
  instead of guessing.
- NEVER provide a medical diagnosis, and never confirm or deny whether the user
  "has" a condition. If asked to diagnose, explicitly say you can't diagnose AND
  explicitly recommend seeing a licensed medical professional - both required.
- If a rule result has flag=true on a serious threshold, clearly recommend
  prompt medical attention.
- End your answer with a short "Reasoning:" section explaining, in 1-3
  sentences, how the matched facts and/or rule results above led to your
  answer (which evidence you used and why). This must describe the real
  evidence given above - do not describe a process that didn't happen.

Respond with plain text only - no JSON, no markdown code fences, no
surrounding quotes. Just the answer text itself, ending with the
"Reasoning:" section.`;

      // Dynamically access the active SDK client based on the current key rotation index
      const response = await getAIInstance().models.generateContent({
        model: config.model,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: config.temperature,
        },
      });

      if (!response.text) {
        throw new Error('Gemini Gateway Error: No content text block returned.');
      }

      return response.text.trim();

    } catch (error) {
      // Catch rate limits (429) or explicit free-tier quota failure strings
      const isRateLimit = error.status === 429 || 
                          (error.message && error.message.toLowerCase().includes('quota')) ||
                          (error.message && error.message.includes('429'));

      if (isRateLimit && maxAttempts > 0) {
        // Shift key pool index forward
        const rotated = rotateApiKey();
        
        if (rotated) {
          // Recursively re-run the transaction with the newly selected active API key index
          return this.generateRecommendation(userPrompt, evidence, maxAttempts - 1);
        }
      }

      // Bubble up the exception if all configured tokens are exhausted or if it's a structural error
      throw error;
    }
  }
}