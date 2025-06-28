'use server';

/**
 * @fileOverview An AI agent that suggests a preliminary trust score based on the sentiment analysis of reports and endorsements related to a specific user.
 *
 * - suggestTrustScore - A function that suggests a trust score for a user.
 * - SuggestTrustScoreInput - The input type for the suggestTrustScore function.
 * - SuggestTrustScoreOutput - The return type for the suggestTrustScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrustScoreInputSchema = z.object({
  reportsSentimentScore: z
    .number()
    .describe(
      'The aggregate sentiment score of reports related to the user. Should be between -1 and 1.'
    ),
  endorsementsSentimentScore: z
    .number()
    .describe(
      'The aggregate sentiment score of endorsements related to the user. Should be between -1 and 1.'
    ),
});
export type SuggestTrustScoreInput = z.infer<typeof SuggestTrustScoreInputSchema>;

const SuggestTrustScoreOutputSchema = z.object({
  suggestedTrustScore: z
    .number()
    .describe(
      'A numerical score representing the suggested trust score for the user. The score should be between 0 and 100.'
    ),
  explanation: z
    .string()
    .describe('Explanation of how the trust score was determined.'),
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
  prompt: `You are an AI assistant that suggests a preliminary trust score for users based on the sentiment analysis of reports and endorsements.

  Based on the following sentiment scores, suggest a trust score between 0 and 100, and explain how you arrived at the score.

  Reports Sentiment Score: {{{reportsSentimentScore}}}
  Endorsements Sentiment Score: {{{endorsementsSentimentScore}}}`,
});

const suggestTrustScoreFlow = ai.defineFlow(
  {
    name: 'suggestTrustScoreFlow',
    inputSchema: SuggestTrustScoreInputSchema,
    outputSchema: SuggestTrustScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
