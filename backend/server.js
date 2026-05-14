import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import * as quizController from './src/controllers/quizController.js';
import * as resultController from './src/controllers/resultController.js';

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Quiz routes
app.get('/api/questions', quizController.listQuestions);
app.get('/api/questions/:id', quizController.getQuestion);
app.post('/api/questions', quizController.createQuestion);
app.delete('/api/questions/:id', quizController.deleteQuestion);

// Result routes
app.post('/api/results', resultController.submitResult);
app.get('/api/results', resultController.listResults);
app.get('/api/results/stats', resultController.getStats);

export default app;

// Always listen — Docker và Vercel đều cần server chạy
const port = Number(process.env.PORT || 3001);
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend running on http://localhost:${port}`);
});