const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');

dotenv.config();

const app = express();

// Connect MySQL & sync tables
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware : ajoute _id = id sur tous les objets des réponses JSON
// (compatibilité frontend qui utilise la convention MongoDB _id)
function addIdAlias(data) {
  // Convertit les instances Sequelize en objet plain avant tout
  if (data && typeof data.toJSON === 'function') data = data.toJSON();
  if (Array.isArray(data)) return data.map(addIdAlias);
  if (data && typeof data === 'object' && !Buffer.isBuffer(data)) {
    const out = {};
    for (const k of Object.keys(data)) out[k] = addIdAlias(data[k]);
    if ('id' in out && !('_id' in out)) out._id = out.id;
    return out;
  }
  return data;
}
app.use((req, res, next) => {
  const _json = res.json.bind(res);
  res.json = (data) => _json(addIdAlias(data));
  next();
});

// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/products',   require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders',     require('./routes/orderRoutes'));
app.use('/api/users',      require('./routes/userRoutes'));
app.use('/api/settings',   require('./routes/settingsRoutes'));
app.use('/api/promos',     require('./routes/promoRoutes'));
app.use('/api/contact',    require('./routes/contactRoutes'));
app.use('/api/upload',     require('./routes/uploadRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', db: 'MySQL', env: process.env.NODE_ENV }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Erreur serveur.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur BENCADİ (MySQL) démarré sur le port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
