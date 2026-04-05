import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const isAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[Auth] No token for ${req.path}`);
    res.status(401).json({ success: false, message: 'Нет токена авторизации' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key') as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    console.error(`[Auth] Invalid token for ${req.path}`);
    res.status(401).json({ success: false, message: 'Неверный или просроченный токен' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role.toUpperCase() === 'ADMIN') {
    next();
  } else {
    console.warn(`[Admin] Denied access for ${req.user?.id} (${req.user?.role}) to ${req.path}`);
    res.status(403).json({ success: false, message: 'Отказано в доступе. Требуются права администратора.' });
  }
};
