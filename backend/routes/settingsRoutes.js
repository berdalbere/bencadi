// settingsRoutes.js
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, updateSocialLinks, updateAboutUs } = require('../controllers/settingsController');
const { protect, hasPermission } = require('../middleware/auth');

router.get('/', getSettings);
router.put('/', protect, hasPermission('manageSettings'), updateSettings);
router.put('/social', protect, hasPermission('manageSettings'), updateSocialLinks);
router.put('/about', protect, hasPermission('manageSettings'), updateAboutUs);

module.exports = router;
