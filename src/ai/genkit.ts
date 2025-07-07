import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {Plugin} from 'genkit/plugin';

const plugins: Plugin[] = [];

// This check prevents the app from crashing on startup in environments
// where the AI credentials are not configured.
if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
} else {
    console.warn("WARNING: GOOGLE_API_KEY is not set. Genkit AI features will be disabled.")
}

export const ai = genkit({
  plugins: plugins,
  model: 'googleai/gemini-2.0-flash',
});
