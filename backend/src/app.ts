import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import carRoutes from './routes/cars';
import profileRoutes from './routes/profile';
import selectionContextRoutes from './routes/selectionContext';
import parkingRoutes from './routes/parking';
import { dbManager } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Graceful shutdown...');
  dbManager.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Graceful shutdown...');
  dbManager.close();
  process.exit(0);
});

export default app;
