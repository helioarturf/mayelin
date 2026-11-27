import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { createApiRouter } from './routes.ts';

const app = express();

// Guard against platforms that pre-parse request bodies before Express middleware runs
app.use((req, _res, next) => {
  if (req.body !== undefined && !(req as { _body?: boolean })._body) {
    (req as { _body?: boolean })._body = true;
  }
  next();
});

app.use(express.json({ limit: '6mb' }));

const apiRouter = createApiRouter();
app.use('/api', apiRouter);
app.use('/', apiRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota da API não encontrada.' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API error:', err);
  const message = err instanceof Error ? err.message : 'Erro interno no servidor.';
  res.status(500).json({ error: message });
});

export default app;
