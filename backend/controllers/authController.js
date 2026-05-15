const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { auditLog } = require('../middleware/audit');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.scope('withPassword').findOne({
      where: { email },
      include: [{ model: db.Role, attributes: ['name'] }],
    });

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.Role.name, name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await auditLog(user.id, 'LOGIN', 'User', user.id, { email });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.Role.name,
        phone: user.phone,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      include: [{ model: db.Role, attributes: ['name'] }],
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.Role.name,
      phone: user.phone,
      avatar_url: user.avatar_url,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await db.User.scope('withPassword').findByPk(req.user.id);

    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.password_hash = bcrypt.hashSync(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
