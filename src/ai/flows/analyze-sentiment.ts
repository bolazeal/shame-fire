'use server';

/**
 * @fileOverview Analyzes the sentiment of text content for moderation purposes.
 *
 * - analyzeSentiment - A function that analyzes the sentiment of the input text.
 * - AnalyzeSentimentInput - The input type for the analyzeSentiment function.
 * - AnalyzeSentimentOutput - The return type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentInputSchema = z.object({
  text: z.string().describe('The text content to analyze.'),
});
export type AnalyzeSentimentInput = z.infer<typeof AnalyzeSentimentInputSchema>;

const AnalyzeSentimentOutputSchema = z.object({
  sentimentScore: z
    .number()
    .describe(
      'A numerical score representing the sentiment of the text.  Higher values indicate more positive sentiment, while lower values indicate more negative sentiment.  The score should be between -1 and 1.'
    ),
  biasDetected: z
    .boolean()
    .describe(
      'Whether or not any biases or inaccuracies are detected in the text.'
    ),
  biasExplanation: z
    .string()
    .optional()
    .describe('Explanation of any biases or inaccuracies detected.'),
});
export type AnalyzeSentimentOutput = z.infer<typeof AnalyzeSentimentOutputSchema>;

export async function analyzeSentiment(input: AnalyzeSentimentInput): Promise<AnalyzeSentimentOutput> {
  return analyzeSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSentimentPrompt',
  input: {schema: AnalyzeSentimentInputSchema},
  output: {schema: AnalyzeSentimentOutputSchema},
  prompt: `You are an AI sentiment analysis tool for detecting biases and inaccuracies in reports and endorsements.

  Analyze the following text and provide a sentiment score between -1 and 1, where -1 is very negative, and 1 is very positive.
  Also, determine whether any biases or inaccuracies are present in the text. If biases or inaccuracies are detected, then explain the bias detected.

  Text: {{{text}}}`,
});

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: AnalyzeSentimentInputSchema,
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
