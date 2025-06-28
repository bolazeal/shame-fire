'use server';

/**
 * @fileOverview An AI agent that summarizes endorsements and reports.
 *
 * - generateEndorsementSummary - A function that handles the content summarization process.
 * - GenerateEndorsementSummaryInput - The input type for the generateEndorsementSummary function.
 * - GenerateEndorsementSummaryOutput - The return type for the generateEndorsementSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateEndorsementSummaryInputSchema = z.object({
  endorsementText: z
    .string()
    .describe('The full text of the endorsement or report to be summarized.'),
});
export type GenerateEndorsementSummaryInput = z.infer<
  typeof GenerateEndorsementSummaryInputSchema
>;

const GenerateEndorsementSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A short, single-sentence summary of the content.'),
});
export type GenerateEndorsementSummaryOutput = z.infer<
  typeof GenerateEndorsementSummaryOutputSchema
>;

export async function generateEndorsementSummary(
  input: GenerateEndorsementSummaryInput
): Promise<GenerateEndorsementSummaryOutput> {
  return generateEndorsementSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEndorsementSummaryPrompt',
  input: {schema: GenerateEndorsementSummaryInputSchema},
  output: {schema: GenerateEndorsementSummaryOutputSchema},
  prompt: `You are an AI assistant that summarizes user-submitted content.

  Summarize the following report or endorsement in a single, neutral sentence:

  {{{endorsementText}}}`,
});

const generateEndorsementSummaryFlow = ai.defineFlow(
  {
    name: 'generateEndorsementSummaryFlow',
    inputSchema: GenerateEndorsementSummaryInputSchema,
    outputSchema: GenerateEndorsementSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
