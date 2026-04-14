const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Promo } = require('../models');
const { protect, hasPermission } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const now = new Date();
  const promos = await Promo.findAll({
    where: { isActive: true, startDate: { [Op.lte]: now }, endDate: { [Op.gte]: now } },
    order: [['order', 'ASC']],
  });
  res.json({ success: true, promos });
});

router.get('/all', protect, hasPermission('managePromos'), async (req, res) => {
  const promos = await Promo.findAll({ order: [['createdAt', 'DESC']] });
  res.json({ success: true, promos });
});

router.post('/validate-coupon', async (req, res) => {
  const { code, cartTotal } = req.body;
  const now = new Date();
  const promo = await Promo.findOne({
    where: {
      couponCode: code.toUpperCase(),
      type: 'coupon',
      isActive: true,
      startDate: { [Op.lte]: now },
      endDate: { [Op.gte]: now },
    },
  });
  if (!promo) return res.status(404).json({ success: false, message: 'Code promo invalide ou expiré.' });
  if (promo.maxUsage > 0 && promo.usageCount >= promo.maxUsage)
    return res.status(400).json({ success: false, message: 'Limite d\'utilisation atteinte.' });
  if (cartTotal < promo.minPurchase)
    return res.status(400).json({ success: false, message: `Achat minimum de ${promo.minPurchase} FCFA requis.` });

  const discount = promo.discountType === 'percentage'
    ? (cartTotal * promo.discountValue) / 100
    : Number(promo.discountValue);

  res.json({ success: true, promo, discount });
});

router.post('/', protect, hasPermission('managePromos'), async (req, res) => {
  try {
    if (req.body.couponCode) req.body.couponCode = req.body.couponCode.toUpperCase();
    const promo = await Promo.create(req.body);
    res.status(201).json({ success: true, promo });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, hasPermission('managePromos'), async (req, res) => {
  try {
    const promo = await Promo.findByPk(req.params.id);
    if (!promo) return res.status(404).json({ success: false, message: 'Promotion introuvable.' });
    await promo.update(req.body);
    res.json({ success: true, promo });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, hasPermission('managePromos'), async (req, res) => {
  const promo = await Promo.findByPk(req.params.id);
  if (!promo) return res.status(404).json({ success: false, message: 'Promotion introuvable.' });
  await promo.destroy();
  res.json({ success: true, message: 'Promotion supprimée.' });
});

module.exports = router;
