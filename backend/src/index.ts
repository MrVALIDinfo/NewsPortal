import path from 'path';
import express, { Request, Response } from 'express';
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

// Путь к статическим файлам фронтенда (после сборки)
const frontendPath = path.join(__dirname, '../../frontend/dist');

// Подключение маршрутов API
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

// Обслуживание статики фронтенда
app.use(express.static(frontendPath));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Все остальные запросы направляем на index.html (для React Router)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
