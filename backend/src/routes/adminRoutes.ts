import { Router } from 'express';
import { createPost, updatePost, deletePost, deleteComment, getComments, updateCommentStatus } from '../controllers/adminController';
import { isAuth, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Применяем мидлвары ко всем марштрутам админа
router.use(isAuth, isAdmin);

router.post('/posts', createPost);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);
router.get('/comments', getComments);
router.patch('/comments/:id/status', updateCommentStatus);
router.delete('/comments/:id', deleteComment);

export default router;
