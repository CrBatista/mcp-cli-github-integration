import express from 'express';
import { config } from './config/env';
import { initDb } from './db';
import authRoutes from './routes/authRoutes';
import connectionsRoutes from './routes/connectionsRoutes';
import actionsRoutes from './routes/actionsRoutes';
import healthRoutes from './routes/healthRoutes';

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/connections', connectionsRoutes);
app.use('/actions', actionsRoutes);
app.use('/health', healthRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

export const startServer = () => {
  initDb();
  app.listen(config.port, () => {
    console.log(`GitHub Integration Hub listening on port ${config.port}`);
  });
};

if (require.main === module) {
  startServer();
}
