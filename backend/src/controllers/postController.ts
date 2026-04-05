import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

const commentSchema = z.object({
  content: z.string().min(1, 'Комментарий не может быть пустым'),
  imageUrl: z.string().url('Некорректный URL изображения').optional().or(z.literal('')).or(z.null()),
  guestName: z.string().optional(),
  guestInitials: z.string().optional(),
  guestColor: z.string().optional(),
});

export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const tag = (req.query.tag as string) || '';
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as string) === 'asc' ? 'asc' : 'desc';

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (tag) {
      whereClause.tags = { contains: tag };
    }

    const total = await prisma.post.count({ where: whereClause });

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, initials: true, color: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit,
    });

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, initials: true, color: true, bio: true, createdAt: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true, initials: true, color: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!post) {
      res.status(404).json({ success: false, message: 'Новость не найдена' });
      return;
    }

    // Увеличиваем количество просмотров
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, initials: true, color: true, bio: true, createdAt: true }
        },
        comments: {
          include: {
            author: {
               select: { id: true, name: true, avatarUrl: true, initials: true, color: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const validatedData = commentSchema.parse(req.body);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ success: false, message: 'Новость не найдена' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        imageUrl: validatedData.imageUrl,
        postId,
        authorId: (req.user?.id || undefined) as any,
        guestName: (req.user ? undefined : (validatedData.guestName || 'Гость')) as any,
        guestInitials: (req.user ? undefined : (validatedData.guestInitials || 'Г')) as any,
        guestColor: (req.user ? undefined : (validatedData.guestColor || '#9CA3AF')) as any,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, initials: true, color: true }
        }
      }
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Ошибка валидации', errors: (error as any).errors });
      return;
    }
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    res.status(500).json({ success: false, message });
  }
};
