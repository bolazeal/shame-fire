'use server';

/**
 * @fileOverview An AI agent that summarizes endorsements.
 *
 * - generateEndorsementSummary - A function that handles the endorsement summarization process.
 * - GenerateEndorsementSummaryInput - The input type for the generateEndorsementSummary function.
 * - GenerateEndorsementSummaryOutput - The return type for the generateEndorsementSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEndorsementSummaryInputSchema = z.object({
  endorsementText: z
    .string()
    .describe('The full text of the endorsement to be summarized.'),
});
export type GenerateEndorsementSummaryInput = z.infer<
  typeof GenerateEndorsementSummaryInputSchema
>;

const GenerateEndorsementSummaryOutputSchema = z.object({
  summary: z.string().describe('A short summary of the endorsement.'),
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
  prompt: `You are an AI assistant that summarizes endorsements.

  Summarize the following endorsement in a single sentence:

  {{endorsementText}}`,
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
