'use server';

/**
 * @fileOverview An AI agent that analyzes a post to determine if it represents a cause worthy of social advocacy and fundraising.
 *
 * - identifyAdvocacyCause - A function that analyzes a post for advocacy potential.
 * - IdentifyAdvocacyCauseInput - The input type for the identifyAdvocacyCause function.
 * - IdentifyAdvocacyCauseOutput - The return type for the identifyAdvocacyCause function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IdentifyAdvocacyCauseInputSchema = z.object({
  postText: z
    .string()
    .describe('The full text of the report or dispute post.'),
  postType: z
    .enum(['report', 'dispute'])
    .describe('The type of the post being analyzed.'),
});
export type IdentifyAdvocacyCauseInput = z.infer<
  typeof IdentifyAdvocacyCauseInputSchema
>;

const IdentifyAdvocacyCauseOutputSchema = z.object({
  isAdvocacyCause: z
    .boolean()
    .describe(
      'Whether the post describes a situation of significant injustice where the victim lacks representation and would benefit from community support.'
    ),
  suggestedTitle: z
    .string()
    .optional()
    .describe(
      'If isAdvocacyCause is true, a compelling and concise title for a fundraising campaign (e.g., "Justice for the Wrongfully Evicted Family").'
    ),
  suggestedGoal: z
    .number()
    .optional()
    .describe(
      'If isAdvocacyCause is true, a suggested fundraising goal in USD appropriate for the situation (e.g., legal fees, damages).'
    ),
  reasoning: z
    .string()
    .describe(
      'A brief explanation for the decision, especially if isAdvocacyCause is true.'
    ),
});
export type IdentifyAdvocacyCauseOutput = z.infer<
  typeof IdentifyAdvocacyCauseOutputSchema
>;

export async function identifyAdvocacyCause(
  input: IdentifyAdvocacyCauseInput
): Promise<IdentifyAdvocacyCauseOutput> {
  return identifyAdvocacyCauseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyAdvocacyCausePrompt',
  input: { schema: IdentifyAdvocacyCauseInputSchema },
  output: { schema: IdentifyAdvocacyCauseOutputSchema },
  prompt: `You are an AI assistant for a social justice platform. Your task is to analyze a user's post and determine if it qualifies as a social advocacy cause that the community could support, potentially with fundraising.

A post qualifies if it meets these criteria:
1.  It describes a clear and significant injustice (e.g., wrongful termination, consumer fraud, landlord-tenant disputes, civil rights violations).
2.  The victim appears to lack the resources or means for proper representation.
3.  The situation is something the community could plausibly help with (e.g., legal fees, replacing lost funds, community organizing).

Do not flag general complaints, service quality issues, or personal disputes without a broader social justice component.

Analyze the following post:
Post Type: {{{postType}}}
Post Text: {{{postText}}}

Based on your analysis, set 'isAdvocacyCause' to true or false. If true, provide a 'suggestedTitle' for a campaign and a reasonable 'suggestedGoal' in USD. Always provide your 'reasoning'.`,
});

const identifyAdvocacyCauseFlow = ai.defineFlow(
  {
    name: 'identifyAdvocacyCauseFlow',
    inputSchema: IdentifyAdvocacyCauseInputSchema,
    outputSchema: IdentifyAdvocacyCauseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
