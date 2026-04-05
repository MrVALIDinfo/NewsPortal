import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'Пользователь с таким email уже существует' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'super-secret-jwt-key',
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...userData } = user;

    res.status(201).json({
      success: true,
      user: userData,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Ошибка валидации', errors: (error as any).errors });
      return;
    }
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Пользователь не найден' });
      return;
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Неверный пароль' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'super-secret-jwt-key',
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...userData } = user;

    res.status(200).json({
      success: true,
      user: userData,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Ошибка валидации', errors: (error as any).errors });
      return;
    }
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Не авторизован' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Пользователь не найден' });
      return;
    }

    const { passwordHash: _, ...userData } = user;

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};
