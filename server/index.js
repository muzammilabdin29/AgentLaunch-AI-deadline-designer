import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const schema = {
  type: 'object',
  properties: {
    milestones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          date: { type: 'string', description: 'Date formatted YYYY-MM-DD' }
        },
        required: ['title', 'date']
      }
    }
  },
  required: ['milestones']
};

const rateCounters = new Map();

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (_, res) => {
  res.json({ ok: true, aiReady: Boolean(process.env.GEMINI_API_KEY) });
});

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d;
}

app.post('/api/milestones', async (req, res) => {
  const id = req.ip || 'anonymous';
  const now = Date.now();
  const previous = rateCounters.get(id) || [];
  const recent = previous.filter(timestamp => now - timestamp < 60000);
  if (recent.length >= 12) return res.status(429).json({ error: 'Please try again in a minute.' });
  recent.push(now);
  rateCounters.set(id, recent);

  const { goal, deadline, today, vibe } = req.body || {};
  if (typeof goal !== 'string' || goal.trim().length < 5 || goal.length > 160 ||
      !validDate(deadline) || !validDate(today) || deadline < today ||
      !['mission', 'aurora', 'minimal'].includes(vibe)) {
    return res.status(400).json({ error: 'Enter a goal and a valid upcoming deadline.' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'AI is not configured. Add GEMINI_API_KEY to your environment variables. You can still use starter milestones.' });
  }

  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';
  const prompt = `Plan five milestones for this goal:\n${goal.trim()}\nToday: ${today}\nDeadline: ${deadline}\nVisual style: ${vibe}. Every milestone date must be YYYY-MM-DD, be between today and deadline inclusive, in chronological order; the final milestone date must be ${deadline}.`;
  const systemInstruction = 'You are an expert goal-planning assistant. Return only valid JSON with an array named "milestones" containing exactly 5 items. Each item must have "title" (3 to 7 words, max 45 characters) and "date" (formatted YYYY-MM-DD). Milestones must progress chronologically ending on the deadline. No markdown fences, no explanatory text.';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let responseText = null;
    let usedMethod = 'interactions';

    // 1. Primary: Use Interactions API with gemini-3.8-flash (Recommended by Google)
    try {
      const interaction = await ai.interactions.create({
        model,
        system_instruction: systemInstruction,
        input: prompt,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema
        }
      });
      responseText = interaction.output_text;
    } catch (interactionError) {
      console.warn('Interactions API call failed, attempting models.generateContent fallback:', interactionError.message);
      
      // 2. Fallback: models.generateContent
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });
      responseText = response.text;
      usedMethod = 'generateContent';
    }

    if (!responseText) {
      throw new Error('Empty response received from Gemini API');
    }

    const cleanJson = responseText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const data = JSON.parse(cleanJson || '{}');
    const rawList = Array.isArray(data.milestones) ? data.milestones : Array.isArray(data) ? data : null;
    if (!rawList || rawList.length === 0) throw new Error('Unexpected milestone response structure');

    const milestones = rawList.slice(0, 5).map((item, i) => {
      const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : (item.name || `Milestone ${i + 1}`);
      const date = validDate(item.date) ? item.date : deadline;
      return {
        id: `ai-${i}-${now}`,
        title: title.slice(0, 48),
        date: date < today ? today : date > deadline ? deadline : date
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    while (milestones.length < 5) {
      milestones.push({
        id: `ai-${milestones.length}-${now}`,
        title: 'Review and finalize launch',
        date: deadline
      });
    }

    milestones[milestones.length - 1].date = deadline;
    res.json({ milestones, source: 'gemini', method: usedMethod });
  } catch (error) {
    console.error('Gemini API generation failed:', error);
    res.status(502).json({
      error: `Gemini generation failed: ${error.message || 'Check your key, model access, and quota.'}`
    });
  }
});

app.use(express.static(path.join(root, 'dist')));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(root, 'dist', 'index.html'));
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AgentLaunch server running on http://localhost:${PORT}`);
});
