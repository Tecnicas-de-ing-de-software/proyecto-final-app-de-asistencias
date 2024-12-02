// auth.routes.js
import express from 'express';
import { login, register, logout } from '../controllers/auth.controller.js';
import protect from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', protect ,register);
router.post('/logout', logout);

export default router;
