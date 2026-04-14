const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  addReview, getSearchSuggestions, getProductStats,
} = require('../controllers/productController');
const { protect, hasPermission, optionalAuth } = require('../middleware/auth');

router.get('/suggestions', getSearchSuggestions);
router.get('/stats', protect, hasPermission('manageProducts'), getProductStats);
router.get('/', getProducts);
router.get('/:slug', getProduct);
router.post('/', protect, hasPermission('manageProducts'), createProduct);
router.put('/:id', protect, hasPermission('manageProducts'), updateProduct);
router.delete('/:id', protect, hasPermission('manageProducts'), deleteProduct);
router.post('/:id/reviews', optionalAuth, addReview);

module.exports = router;
