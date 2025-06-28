import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-sentiment.ts';
import '@/ai/flows/generate-endorsement-summary.ts';
import '@/ai/flows/suggest-categories.ts';
import '@/ai/flows/suggest-trust-score.ts';
import '@/ai/flows/detect-harmful-content.ts';
