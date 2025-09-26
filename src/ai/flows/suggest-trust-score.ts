'use server';

/**
 * @fileOverview An AI agent that suggests a new trust score based on a new post and the user's current score.
 *
 * - suggestTrustScore - A function that suggests a trust score for a user.
 * - SuggestTrustScoreInput - The input type for the suggestTrustScore function.
 * - SuggestTrustScoreOutput - The return type for the suggestTrustScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrustScoreInputSchema = z.object({
  currentTrustScore: z
    .number()
    .describe(
      'The current trust score of the user, between 0 and 100.'
    ),
  postType: z
    .enum(['report', 'endorsement'])
    .describe("The type of the new post concerning the user."),
  postSentimentScore: z
    .number()
    .describe(
      'The sentiment score of the new post, between -1 (very negative) and 1 (very positive).'
    ),
});
export type SuggestTrustScoreInput = z.infer<typeof SuggestTrustScoreInputSchema>;

const SuggestTrustScoreOutputSchema = z.object({
  newTrustScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'The newly calculated trust score for the user, between 0 and 100.'
    ),
  explanation: z
    .string()
    .describe('A brief explanation of why the score was adjusted.'),
});
export type SuggestTrustScoreOutput = z.infer<typeof SuggestTrustScoreOutputSchema>;

export async function suggestTrustScore(
  input: SuggestTrustScoreInput
): Promise<SuggestTrustScoreOutput> {
  return suggestTrustScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTrustScorePrompt',
  input: {schema: SuggestTrustScoreInputSchema},
  output: {schema: SuggestTrustScoreOutputSchema},
  prompt: `You are an AI assistant that calculates a user's Trust Score for a public accountability platform. The score is a number between 0 and 100.

A new post has been made about a user. Adjust their Trust Score based on this new information.

- A 'report' with negative sentiment should decrease the score.
- An 'endorsement' with positive sentiment should increase the score.
- The magnitude of the change should be proportional to the post's sentiment score. A highly negative report should cause a larger drop than a mildly negative one.
- The final score must remain between 0 and 100.

Current Trust Score: {{{currentTrustScore}}}
New Post Type: {{{postType}}}
New Post Sentiment Score: {{{postSentimentScore}}}

Calculate the new trust score and provide a brief, one-sentence explanation for the change.`,
});

const suggestTrustScoreFlow = ai.defineFlow(
  {
    name: 'suggestTrustScoreFlow',
    inputSchema: SuggestTrustScoreInputSchema,
    outputSchema: SuggestTrustScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the score is clipped to the 0-100 range.
    if (output) {
        output.newTrustScore = Math.max(0, Math.min(100, Math.round(output.newTrustScore)));
    }
    return output!;
  }
);
