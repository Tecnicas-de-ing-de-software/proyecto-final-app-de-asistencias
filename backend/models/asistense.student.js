
// models/asistense.student.js
import mongoose from "mongoose";

const newAsistence = mongoose.Schema({
  name: {
    type: String
  },
  apellido: {
    type: String
  },
  fecha: {
    type: Date
  },
  presente: {
    type: Boolean
  }
});

const newAsistenceModel = mongoose.model("asistencias", newAsistence);
export default newAsistenceModel;