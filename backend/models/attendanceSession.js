// models/attendanceSession.js
import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema({
  sessionName: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  createdBy: { type: String, required: true }
});

export default mongoose.model('AttendanceSession', attendanceSessionSchema);

