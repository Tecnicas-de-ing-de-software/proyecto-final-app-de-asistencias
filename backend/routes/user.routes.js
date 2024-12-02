// user.routes.js
import express from 'express';
import protect from '../middlewares/auth.middleware.js';
import { getUsers, updateUser, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

export default router;
