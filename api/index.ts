import 'dotenv/config';
import express from 'express';
import { createApiRouter } from '../server/routes.ts';

const app = express();
app.use(express.json({ limit: '1mb' }));

const apiRouter = createApiRouter();
app.use('/api', apiRouter);
app.use('/', apiRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota da API não encontrada.' });
});

export default app;
