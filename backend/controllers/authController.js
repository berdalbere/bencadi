const { User, Wishlist, Product } = require('../models');
const { generateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Nom, email et mot de passe requis.' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Le mot de passe doit avoir au moins 6 caractères.' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé.' });

    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user.id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Compte désactivé.' });

    const token = generateToken(user.id);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    // Get wishlist
    const wishlists = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug', 'price', 'comparePrice', 'mainImage', 'stock', 'rating'] }],
    });
    const userObj = user.toJSON();
    userObj.wishlist = wishlists.map(w => w.product).filter(Boolean);
    res.json({ success: true, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    await req.user.update({ name, phone });
    res.json({ success: true, user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect.' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit avoir au moins 6 caractères.' });
    await user.update({ password: newPassword });
    res.json({ success: true, message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/wishlist/:productId
exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);

    const existing = await Wishlist.findOne({ where: { userId, productId } });
    if (existing) {
      await existing.destroy();
      return res.json({ success: true, inWishlist: false, message: 'Retiré des favoris.' });
    } else {
      await Wishlist.create({ userId, productId });
      return res.json({ success: true, inWishlist: true, message: 'Ajouté aux favoris.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
