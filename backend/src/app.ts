import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth';
import carRoutes from './routes/cars';
import profileRoutes from './routes/profile';
import selectionContextRoutes from './routes/selectionContext';
import parkingRoutes from './routes/parking';
import { dbManager } from './config/database';
import { openApiDocument } from './swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Документация API (Swagger UI) — порядок важен: сначала serve (статика), затем GET (страница)
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(openApiDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
}));
app.get('/api-docs.json', (_, res) => res.json(openApiDocument));

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/selection-context', selectionContextRoutes);
app.use('/api/parking', parkingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Parking API is running' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function start() {
  await dbManager.initialize();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Graceful shutdown...');
  dbManager.close().then(() => process.exit(0)).catch(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Graceful shutdown...');
  dbManager.close().then(() => process.exit(0)).catch(() => process.exit(1));
});

export default app;
