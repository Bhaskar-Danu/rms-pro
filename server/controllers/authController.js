const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password, restaurant_name, role } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Username, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Users who register through the main form are restaurant owners/managers → admin role.
    // Staff members are created separately via the Staff management page.
    const userRole = 'admin';
    const user = await User.create({ username, email, password, restaurant_name, role: userRole });
    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, restaurant_name: user.restaurant_name, role: user.role },
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ error: `${field.charAt(0).toUpperCase() + field.slice(1)} already taken` });
    }
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password)
      return res.status(400).json({ error: 'Email/username and password are required' });

    const user = await User.findOne({
      $or: [{ email: login.toLowerCase() }, { username: login }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, restaurant_name: user.restaurant_name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
