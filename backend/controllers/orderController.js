const { Op, fn, col } = require('sequelize');
const { Order, OrderItem, OrderStatusHistory, Product, User } = require('../models');

const ORDER_INCLUDES = [
  {
    model: OrderItem, as: 'items',
  },
  {
    model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'],
    required: false,
  },
  {
    model: OrderStatusHistory, as: 'statusHistory',
    include: [{ model: User, as: 'updatedBy', foreignKey: 'updatedById', attributes: ['id', 'name'], required: false }],
    separate: true,
    order: [['date', 'DESC']],
  },
];

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes, guestEmail, guestName, couponCode } = req.body;
    if (!items?.length) return res.status(400).json({ success: false, message: 'Aucun article dans la commande.' });
    if (!shippingAddress?.name || !shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.phone)
      return res.status(400).json({ success: false, message: 'Adresse de livraison incomplète.' });

    // Validate items & calculate subtotal
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Produit ${item.product} introuvable.` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Stock insuffisant pour ${product.name}.` });

      subtotal += Number(product.price) * item.quantity;
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.mainImage,
        color: item.color || '',
      });
    }

    const shippingCost = subtotal >= 100000 ? 0 : 3000;
    const totalAmount = subtotal + shippingCost;

    const order = await Order.create({
      userId: req.user?.id || null,
      guestEmail, guestName,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      notes,
      couponCode,
      subtotal,
      shippingCost,
      totalAmount,
    });

    // Create order items
    const createdItems = await OrderItem.bulkCreate(
      orderItems.map(i => ({ ...i, orderId: order.id }))
    );

    // Decrement stock
    for (const item of items) {
      await Product.decrement('stock', { by: item.quantity, where: { id: item.product } });
      await Product.increment('soldCount', { by: item.quantity, where: { id: item.product } });
    }

    // Add initial status history
    await OrderStatusHistory.create({ orderId: order.id, status: 'pending', note: 'Commande créée' });

    res.status(201).json({ success: true, order: { ...order.toJSON(), items: createdItems } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: ORDER_INCLUDES });
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    // Check ownership
    if (req.user.role === 'client' && order.userId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 15, status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[require('sequelize').Op.or] = [
        { orderNumber: { [require('sequelize').Op.like]: `%${search}%` } },
        { guestName: { [require('sequelize').Op.like]: `%${search}%` } },
        { guestEmail: { [require('sequelize').Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'], required: false },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      distinct: true,
    });

    res.json({
      success: true,
      orders: rows,
      pagination: { total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable.' });

    await order.update({ status });
    await OrderStatusHistory.create({
      orderId: order.id, status, note: note || '',
      updatedById: req.user.id, date: new Date(),
    });

    const updated = await Order.findByPk(order.id, { include: ORDER_INCLUDES });
    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/stats
exports.getOrderStats = async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const [totalOrders, pendingOrders, deliveredOrders, revenueResult] = await Promise.all([
      Order.count(),
      Order.count({ where: { status: 'pending' } }),
      Order.count({ where: { status: 'delivered' } }),
      Order.findOne({
        attributes: [[fn('SUM', col('totalAmount')), 'total']],
        where: { status: ['delivered', 'shipped', 'processing'] },
        raw: true,
      }),
    ]);
    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue: Number(revenueResult?.total || 0),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
