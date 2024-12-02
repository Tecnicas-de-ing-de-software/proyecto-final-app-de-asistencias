import User from '../models/User.model.js';

const getUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  const users = await User.find().select('-password');
  res.json(users);
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;


  delete updatedData.password;
  delete updatedData.role;

  if (req.user.role === 'admin' || req.user._id.toString() === id) {
    const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true }).select('-password');
    res.json(updatedUser);
  } else {
    res.status(403).json({ msg: 'Access denied. You can only update your own information.' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }

  await User.findByIdAndDelete(id);
  res.json({ msg: 'User deleted' });
};

export { getUsers, updateUser, deleteUser };
