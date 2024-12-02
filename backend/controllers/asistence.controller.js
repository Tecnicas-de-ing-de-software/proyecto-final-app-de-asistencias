// controllers/attendance.controller.js
import Attendance from '../models/attendance.js';
import AttendanceSession from '../models/attendanceSession.js';
import { io } from '../index.js';

export const createAttendanceSession = async (req, res) => {
  const { sessionName, date, startTime, endTime, createdBy } = req.body;
  try {
    const newSession = new AttendanceSession({ sessionName, date, startTime, endTime, createdBy });
    await newSession.save();
    io.emit('new_attendance_session', newSession);
    res.status(201).json({ msg: "Attendance session created successfully", session: newSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creating attendance session" });
  }
};

export const markAttendance = async (req, res) => {
  const { sessionId, name, apellido, present } = req.body;
  
  try {
    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: "Attendance session not found" });
    }

    // Buscar asistencias previas del estudiante
    const previousAttendance = await Attendance.findOne({
      'student.name': name,
      'student.apellido': apellido
    });

    const newCount = previousAttendance ? previousAttendance.attendanceCount + 1 : 1;

    const attendance = new Attendance({
      session: sessionId,
      student: { name, apellido },
      present,
      attendanceCount: present ? newCount : 0
    });

    await attendance.save();
    
    io.emit('attendance_marked', {
      sessionId,
      studentName: `${name} ${apellido}`,
      present,
      attendanceCount: attendance.attendanceCount
    });

    res.status(201).json({ msg: "Attendance marked successfully", attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error marking attendance" });
  }
};


export const getSessionAttendance = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const attendances = await Attendance.find({ session: sessionId });
    res.status(200).json(attendances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error retrieving attendances" });
  }
};