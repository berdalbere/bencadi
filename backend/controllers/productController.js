const { Op, fn, col, literal } = require('sequelize');
const { sequelize, Product, Category, ProductImage, ProductAttribute, Review, User } = require('../models');
const slugify = require('slugify');

const buildIncludes = (minimal = false) => {
  if (minimal) return [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] }];
  return [
    { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon', 'color'] },
    { model: ProductImage, as: 'images', attributes: ['id', 'url', 'order'], separate: true, order: [['order', 'ASC']] },
    { model: ProductAttribute, as: 'attributes', attributes: ['id', 'type', 'value'], separate: true },
  ];
};

const formatProduct = (p) => {
  const obj = p.toJSON ? p.toJSON() : p;
  const attrs = obj.attributes || [];
  obj.colors = attrs.filter(a => a.type === 'color').map(a => a.value);
  obj.tags = attrs.filter(a => a.type === 'tag').map(a => a.value);
  obj.features = attrs.filter(a => a.type === 'feature').map(a => a.value);
  obj.images = (obj.images || []).map(i => i.url);
  delete obj.attributes;
  return obj;
};

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, sort = 'newest',
      search, category, minPrice, maxPrice,
      isNew, isPromo, isFeatured, isPublished,
    } = req.query;

    const where = {};
    // Only show published by default (unless admin)
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';
    else where.isPublished = true;

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { shortDescription: { [Op.like]: `%${search}%` } },
      ];
    }
    if (isNew === 'true') where.isNew = true;
    if (isPromo === 'true') where.isPromo = true;
    if (isFeatured === 'true') where.isFeatured = true;
    if (minPrice) where.price = { ...(where.price || {}), [Op.gte]: Number(minPrice) };
    if (maxPrice) where.price = { ...(where.price || {}), [Op.lte]: Number(maxPrice) };

    // Category filter by slug or id
    let categoryInclude = { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] };
    if (category) {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }

    const sortMap = {
      newest: [['createdAt', 'DESC']],
      oldest: [['createdAt', 'ASC']],
      price_asc: [['price', 'ASC']],
      price_desc: [['price', 'DESC']],
      rating: [['rating', 'DESC']],
      popular: [['soldCount', 'DESC']],
    };

    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [categoryInclude],
      order: sortMap[sort] || [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    res.json({
      success: true,
      products: rows.map(p => formatProduct(p)),
      pagination: {
        total: count,
        page: Number(page),
        pages: Math.ceil(count / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/suggestions?q=
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });

    const products = await Product.findAll({
      where: {
        isPublished: true,
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { brand: { [Op.like]: `%${q}%` } },
        ],
      },
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      attributes: ['id', 'name', 'slug', 'mainImage', 'price', 'categoryId'],
      limit: 6,
    });

    res.json({ success: true, suggestions: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/stats
exports.getProductStats = async (req, res) => {
  try {
    const [total, published, outOfStock, featured] = await Promise.all([
      Product.count(),
      Product.count({ where: { isPublished: true } }),
      Product.count({ where: { stock: 0 } }),
      Product.count({ where: { isFeatured: true } }),
    ]);
    res.json({ success: true, stats: { total, published, outOfStock, featured } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:slug
exports.getProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const where = isNaN(slug) ? { slug } : { id: slug };

    const product = await Product.findOne({
      where,
      include: [
        ...buildIncludes(),
        {
          model: Review, as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
          separate: true,
          order: [['createdAt', 'DESC']],
          limit: 20,
        },
      ],
    });

    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable.' });

    // Increment view count
    await product.increment('viewCount');

    // Related products
    const related = await Product.findAll({
      where: { categoryId: product.categoryId, id: { [Op.ne]: product.id }, isPublished: true },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      limit: 4,
    });

    res.json({ success: true, product: formatProduct(product), related: related.map(formatProduct) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { colors = [], tags = [], features = [], images = [], ...data } = req.body;

    // Generate slug
    data.slug = slugify(data.name, { lower: true, strict: true });
    // Ensure unique slug
    const exists = await Product.findOne({ where: { slug: data.slug } });
    if (exists) data.slug = `${data.slug}-${Date.now()}`;

    const product = await Product.create(data, { transaction: t });

    // Attributes
    const attrs = [
      ...colors.map(v => ({ productId: product.id, type: 'color', value: v })),
      ...tags.map(v => ({ productId: product.id, type: 'tag', value: v })),
      ...features.map(v => ({ productId: product.id, type: 'feature', value: v })),
    ];
    if (attrs.length) await ProductAttribute.bulkCreate(attrs, { transaction: t });

    // Images
    if (images.length) {
      await ProductImage.bulkCreate(
        images.map((url, i) => ({ productId: product.id, url, order: i })),
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({ success: true, product });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { colors, tags, features, images, ...data } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable.' });

    if (data.name && data.name !== product.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
      const exists = await Product.findOne({ where: { slug: data.slug, id: { [Op.ne]: id } } });
      if (exists) data.slug = `${data.slug}-${Date.now()}`;
    }

    await product.update(data, { transaction: t });

    // Update attributes if provided
    if (colors !== undefined || tags !== undefined || features !== undefined) {
      await ProductAttribute.destroy({ where: { productId: id }, transaction: t });
      const c = colors || [];
      const tg = tags || [];
      const ft = features || [];
      const attrs = [
        ...c.map(v => ({ productId: id, type: 'color', value: v })),
        ...tg.map(v => ({ productId: id, type: 'tag', value: v })),
        ...ft.map(v => ({ productId: id, type: 'feature', value: v })),
      ];
      if (attrs.length) await ProductAttribute.bulkCreate(attrs, { transaction: t });
    }

    if (images !== undefined) {
      await ProductImage.destroy({ where: { productId: id }, transaction: t });
      if (images.length) {
        await ProductImage.bulkCreate(
          images.map((url, i) => ({ productId: id, url, order: i })),
          { transaction: t }
        );
      }
    }

    await t.commit();
    res.json({ success: true, product });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    await product.destroy();
    res.json({ success: true, message: 'Produit supprimé.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products/:id/reviews
exports.addReview = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable.' });

    const { rating, comment } = req.body;
    if (!rating || !comment) return res.status(400).json({ success: false, message: 'Note et commentaire requis.' });

    // Check if already reviewed
    if (req.user) {
      const existing = await Review.findOne({ where: { productId: product.id, userId: req.user.id } });
      if (existing) return res.status(400).json({ success: false, message: 'Vous avez déjà laissé un avis.' });
    }

    await Review.create({
      productId: product.id,
      userId: req.user?.id || null,
      name: req.user?.name || req.body.name || 'Anonyme',
      rating: Number(rating),
      comment,
    });

    // Recalculate rating
    const reviews = await Review.findAll({ where: { productId: product.id }, attributes: ['rating'] });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await product.update({ rating: Math.round(avg * 10) / 10, numReviews: reviews.length });

    res.status(201).json({ success: true, message: 'Avis ajouté.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
