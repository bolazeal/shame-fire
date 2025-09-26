'use server';

/**
 * @fileOverview An AI agent that analyzes text for harmful content.
 *
 * - detectHarmfulContent - A function that analyzes text for harmful content.
 * - DetectHarmfulContentInput - The input type for the detectHarmfulContent function.
 * - DetectHarmfulContentOutput - The return type for the detectHarmfulContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectHarmfulContentInputSchema = z.object({
  text: z.string().describe('The text content to analyze.'),
});
export type DetectHarmfulContentInput = z.infer<
  typeof DetectHarmfulContentInputSchema
>;

const DetectHarmfulContentOutputSchema = z.object({
  isHarmful: z
    .boolean()
    .describe('Whether or not the text contains harmful content.'),
  reason: z
    .string()
    .describe(
      'A brief explanation if the content is deemed harmful, citing the specific policy violated.'
    ),
});
export type DetectHarmfulContentOutput = z.infer<
  typeof DetectHarmfulContentOutputSchema
>;

export async function detectHarmfulContent(
  input: DetectHarmfulContentInput
): Promise<DetectHarmfulContentOutput> {
  return detectHarmfulContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectHarmfulContentPrompt',
  input: { schema: DetectHarmfulContentInputSchema },
  output: { schema: DetectHarmfulContentOutputSchema },
  prompt: `You are an AI content moderator for a social platform. Your task is to analyze user-submitted text and determine if it violates our safety policies.

Policies prohibit:
- Hate speech (attacks based on race, ethnicity, religion, sexual orientation, etc.)
- Harassment and bullying
- Threats of violence
- Glorification of self-harm
- Sexually explicit content

Analyze the following text. If it violates any of these policies, set isHarmful to true and provide a brief reason (e.g., "Violates hate speech policy."). Otherwise, set isHarmful to false and set the reason to "No violation detected.".

Text: {{{text}}}`,
});

const detectHarmfulContentFlow = ai.defineFlow(
  {
    name: 'detectHarmfulContentFlow',
    inputSchema: DetectHarmfulContentInputSchema,
    outputSchema: DetectHarmfulContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
