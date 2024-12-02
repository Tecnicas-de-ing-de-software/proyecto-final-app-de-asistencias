// routes/attendanceSession.routes.js
import express from 'express';
import AttendanceSession from '../models/attendanceSession.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const session = new AttendanceSession(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const sessions = await AttendanceSession.find();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;