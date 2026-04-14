const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User } = require('../models');
const { protect, hasPermission, adminOnly } = require('../middleware/auth');

router.get('/', protect, hasPermission('manageUsers'), async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const where = {};
  if (role) where.role = role;
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }
  const { count, rows } = await User.findAndCountAll({
    where, order: [['createdAt', 'DESC']],
    limit: Number(limit), offset: (Number(page) - 1) * Number(limit),
  });
  res.json({ success: true, users: rows, pagination: { total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) } });
});

router.get('/:id', protect, hasPermission('manageUsers'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
  res.json({ success: true, user });
});

router.post('/', protect, hasPermission('manageUsers'), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ success: false, message: 'Email déjà utilisé.' });
    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({ success: true, user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, hasPermission('manageUsers'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    if (user.role === 'superadmin' && req.user.role !== 'superadmin')
      return res.status(403).json({ success: false, message: 'Impossible de modifier un super administrateur.' });
    const { name, role, isActive, phone, permissions } = req.body;
    await user.update({ name, role, isActive, phone, permissions });
    res.json({ success: true, user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
  if (user.role === 'superadmin') return res.status(403).json({ success: false, message: 'Impossible de supprimer le super administrateur.' });
  await user.destroy();
  res.json({ success: true, message: 'Utilisateur supprimé.' });
});

router.put('/:id/reset-password', protect, hasPermission('manageUsers'), async (req, res) => {
  const { newPassword } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
  await user.update({ password: newPassword });
  res.json({ success: true, message: 'Mot de passe réinitialisé.' });
});

module.exports = router;
