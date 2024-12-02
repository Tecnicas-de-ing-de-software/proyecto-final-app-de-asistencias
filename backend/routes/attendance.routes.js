// routes/attendance.routes.js
import express from 'express';
import Attendance from '../models/attendance.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Obtener todas las asistencias
router.get('/', async (req, res) => {
  try {
    const attendances = await Attendance.find().populate('session');
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo las asistencias", error });
  }
});

// Obtener asistencias por ID de la sesión
router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const attendances = await Attendance.find({ session: sessionId }).populate('student');
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo las asistencias", error });
  }
});

router.get('/report/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const attendances = await Attendance.find({ session: sessionId })
      .populate('session')
      .sort({ 'student.name': 1, 'student.apellido': 1 });
    
    // Agrupar por estudiante y calcular totales
    const studentReport = attendances.reduce((acc, curr) => {
      const studentKey = `${curr.student.name} ${curr.student.apellido}`;
      if (!acc[studentKey]) {
        acc[studentKey] = {
          name: curr.student.name,
          apellido: curr.student.apellido,
          totalAttendances: 0,
          dates: []
        };
      }
      if (curr.present) {
        acc[studentKey].totalAttendances++;
        acc[studentKey].dates.push(curr.timestamp);
      }
      return acc;
    }, {});

    res.json(Object.values(studentReport));
  } catch (error) {
    res.status(500).json({ message: "Error generando el reporte", error });
  }
});

export default router;
