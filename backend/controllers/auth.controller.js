import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';

const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Verificar si el usuario existe
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: 'User not found' });

  // Verificar la contraseña
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

  // Generar el token JWT
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Enviar el token en una cookie (httpOnly para mayor seguridad)
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.json({ token, role: user.role , firstName:user.firstName, lastName:user.lastName});
};

const register = async (req, res) => {
  const { username, email, password, firstName, lastName, age, image, role } = req.body;

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword, firstName, lastName, age, image, role });
  
  await newUser.save();
  res.json(newUser);
};

const logout = (req, res) => {
  res.clearCookie('token');  // Eliminar la cookie del token
  res.json({ msg: 'Logged out' });
};

export { login, register, logout };
