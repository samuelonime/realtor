const bcrypt = require('bcryptjs');
const db = require('../models');

exports.list = async (req, res) => {
  try {
    const users = await db.User.findAll({
      include: [{ model: db.Role, attributes: ['name'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      include: [{ model: db.Role, attributes: ['name'] }],
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { full_name, email, phone, password, role_id } = req.body;
    const exists = await db.User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email already in use.' });

    const user = await db.User.create({
      full_name,
      email,
      phone,
      password_hash: bcrypt.hashSync(password, 10),
      role_id: role_id || 3,
    });

    res.status(201).json({ message: 'User created successfully.', id: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { full_name, email, phone, role_id, is_active } = req.body;
    if (email && email !== user.email) {
      const exists = await db.User.findOne({ where: { email } });
      if (exists) return res.status(400).json({ error: 'Email already in use.' });
    }

    await user.update({ full_name, email, phone, role_id, is_active });
    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    await user.update({ is_active: false });
    res.json({ message: 'User deactivated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAgents = async (req, res) => {
  try {
    const agents = await db.User.findAll({
      include: [{ model: db.Role, attributes: ['name'], where: { name: ['agent', 'manager'] } }],
      attributes: ['id', 'full_name', 'email', 'phone'],
    });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
