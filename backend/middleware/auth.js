const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Non authentifié.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Compte invalide ou désactivé.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré.' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id);
    } catch {}
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (!['admin','superadmin'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs.' });
  }
  next();
};

const isStaff = (req, res, next) => {
  if (!req.user || req.user.role === 'client') {
    return res.status(403).json({ success: false, message: 'Accès refusé.' });
  }
  next();
};

const hasPermission = (perm) => (req, res, next) => {
  const r = req.user?.role;
  if (r === 'admin' || r === 'superadmin') return next();
  const perms = req.user?.permissions || {};
  if (perms[perm]) return next();
  return res.status(403).json({ success: false, message: `Permission requise: ${perm}` });
};

module.exports = { protect, optionalAuth, adminOnly, isStaff, hasPermission, generateToken };
