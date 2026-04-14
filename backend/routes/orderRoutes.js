const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderStats,
} = require('../controllers/orderController');
const { protect, hasPermission, optionalAuth } = require('../middleware/auth');

router.get('/stats', protect, hasPermission('manageOrders'), getOrderStats);
router.get('/my', protect, getMyOrders);
router.get('/', protect, hasPermission('manageOrders'), getAllOrders);
router.post('/', optionalAuth, createOrder);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, hasPermission('manageOrders'), updateOrderStatus);

module.exports = router;
