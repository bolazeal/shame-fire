
'use server';

import {
  suggestCategories,
  type SuggestCategoriesInput,
  type SuggestCategoriesOutput,
} from '@/ai/flows/suggest-categories';

export async function suggestCategoriesAction(
  input: SuggestCategoriesInput
): Promise<SuggestCategoriesOutput> {
  return suggestCategories(input);
}
