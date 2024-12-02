import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const protect = async (req, res, next) => {
  const token = req.cookies.token;  // Tomar el token de las cookies
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ msg: 'User not found' });

    req.user = user;  // Añadir el usuario a la solicitud
    next();
  } catch (error) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

export default protect;
