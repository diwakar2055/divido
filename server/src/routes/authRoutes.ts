import { Router } from 'express';
import { getProfile, login, loginWithGoogle, logout, signup } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', loginWithGoogle);
router.get('/profile', authMiddleware, getProfile);

export default router;
