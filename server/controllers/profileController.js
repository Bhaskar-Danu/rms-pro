const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

exports.updateProfile = async (req, res) => {
  try {
    const { username, restaurant_name, password, phone, address } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    const update = { username, restaurant_name, phone, address };
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
      // Use 12 rounds — consistent with User model's pre-save hook
      update.password = await bcrypt.hash(password, 12);
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, select: '-password' });
    await ActivityLog.create({ user: req.user.id, username, action: 'Profile Updated', details: `Updated settings for ${username}` });
    res.json({ success: true, user });
  } catch (err) {
    // Friendly error for duplicate username
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already taken by another account' });
    }
    res.status(500).json({ error: err.message });
  }
};
