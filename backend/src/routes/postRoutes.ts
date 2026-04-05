import { Router } from 'express';
import { getPosts, getPostById, addComment } from '../controllers/postController';
import { isAuth } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/:postId/comments', addComment);

export default router;
