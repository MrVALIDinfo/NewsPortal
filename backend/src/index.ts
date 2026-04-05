import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middlewares/errorMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Разрешаем CORS для запросов со всех доменов (по умолчанию для локальной разработки)
app.use(cors());

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Подключение маршрутов
app.get('/', (req, res) => {
  res.json({ message: 'News Portal API is running', version: '1.0' });
});
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
