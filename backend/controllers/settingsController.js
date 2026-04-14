const { Setting } = require('../models');

// Helper: get all settings as a flat object
const getAllSettings = async () => {
  const rows = await Setting.findAll();
  const obj = {};
  rows.forEach(r => { obj[r.key] = r.value; });
  return obj;
};

const upsert = async (key, value) => {
  await Setting.upsert({ key, value });
};

// GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await getAllSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const allowed = ['siteName', 'siteTagline', 'logo', 'email', 'phone', 'address',
      'currency', 'currencySymbol', 'shippingCost', 'freeShippingThreshold'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) await upsert(key, req.body[key]);
    }
    const settings = await getAllSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/settings/social
exports.updateSocialLinks = async (req, res) => {
  try {
    await upsert('socialLinks', req.body);
    res.json({ success: true, message: 'Liens sociaux mis à jour.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/settings/about
exports.updateAboutUs = async (req, res) => {
  try {
    await upsert('aboutUs', req.body);
    res.json({ success: true, message: 'À propos mis à jour.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
