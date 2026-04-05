import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

const postSchema = z.object({
  title: z.string().min(5, 'Заголовок должен содержать минимум 5 символов'),
  content: z.string().min(10, 'Текст должен содержать минимум 10 символов'),
  excerpt: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal('')).or(z.null()),
  category: z.string().min(1, 'Категория обязательна'),
  tags: z.any(),
  readTime: z.number().optional(),
  featured: z.boolean().optional(),
});

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return; // Middleware already handles this, type checking

    const validatedData = postSchema.parse(req.body);

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        tags: typeof validatedData.tags === 'string' ? validatedData.tags : JSON.stringify(validatedData.tags),
        authorId: req.user.id,
      },
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('[Admin] Create Post Error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Ошибка валидации', errors: (error as any).errors });
      return;
    }
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const validatedData = postSchema.partial().parse(req.body);

    const postExists = await prisma.post.findUnique({ where: { id } });
    if (!postExists) {
      res.status(404).json({ success: false, message: 'Новость не найдена' });
      return;
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...validatedData,
        tags: validatedData.tags === undefined ? undefined : (typeof validatedData.tags === 'string' ? validatedData.tags : JSON.stringify(validatedData.tags)),
      },
    });

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Ошибка валидации', errors: (error as any).errors });
      return;
    }
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const postExists = await prisma.post.findUnique({ where: { id } });
    if (!postExists) {
      res.status(404).json({ success: false, message: 'Новость не найдена' });
      return;
    }

    await prisma.post.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Новость успешно удалена' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, initials: true, color: true }
        },
        post: {
          select: { id: true, title: true, imageUrl: true, category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};

export const updateCommentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Некорректный статус' });
      return;
    }

    const commentExists = await prisma.comment.findUnique({ where: { id } });
    if (!commentExists) {
      res.status(404).json({ success: false, message: 'Комментарий не найден' });
      return;
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const commentExists = await prisma.comment.findUnique({ where: { id } });
    if (!commentExists) {
      res.status(404).json({ success: false, message: 'Комментарий не найден' });
      return;
    }

    await prisma.comment.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Комментарий успешно удален' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};
