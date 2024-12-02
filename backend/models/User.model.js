import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  age: Number,
  image: String,
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' }
});

const User = mongoose.model('User', UserSchema);
export default User;