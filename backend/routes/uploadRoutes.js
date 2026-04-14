const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, hasPermission } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  /jpeg|jpg|png|gif|webp|svg/.test(path.extname(file.originalname).toLowerCase())
    ? cb(null, true)
    : cb(new Error('Format non supporté. Utilisez: JPG, PNG, WEBP, SVG'));
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

router.post('/image', protect, hasPermission('manageProducts'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier.' });
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, url, filename: req.file.filename });
});

router.post('/images', protect, hasPermission('manageProducts'), upload.array('images', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'Aucun fichier.' });
  const urls = req.files.map(f => ({
    url: `${req.protocol}://${req.get('host')}/uploads/${f.filename}`,
    filename: f.filename,
  }));
  res.json({ success: true, urls });
});

router.delete('/:filename', protect, hasPermission('manageProducts'), (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); res.json({ success: true }); }
  else res.status(404).json({ success: false, message: 'Fichier introuvable.' });
});

module.exports = router;
