const express = require('express');
const router = express.Router();
const { Category, Product } = require('../models');
const { protect, hasPermission } = require('../middleware/auth');
const slugify = require('slugify');

router.get('/', async (req, res) => {
  const categories = await Category.findAll({
    order: [['order', 'ASC'], ['name', 'ASC']],
  });
  // Add product count
  const withCount = await Promise.all(categories.map(async (c) => {
    const count = await Product.count({ where: { categoryId: c.id, isPublished: true } });
    return { ...c.toJSON(), productCount: count };
  }));
  res.json({ success: true, categories: withCount });
});

router.post('/', protect, hasPermission('manageProducts'), async (req, res) => {
  try {
    const { name, icon, color, description, order } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nom requis.' });
    const slug = slugify(name, { lower: true, strict: true });
    const cat = await Category.create({ name, slug, icon, color, description, order: order || 0 });
    res.status(201).json({ success: true, category: cat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, hasPermission('manageProducts'), async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });
    const { name, icon, color, description, order } = req.body;
    const update = { icon, color, description, order };
    if (name) { update.name = name; update.slug = slugify(name, { lower: true, strict: true }); }
    await cat.update(update);
    res.json({ success: true, category: cat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, hasPermission('manageProducts'), async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });
    await cat.destroy();
    res.json({ success: true, message: 'Catégorie supprimée.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
