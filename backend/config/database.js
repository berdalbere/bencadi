const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'bencadi',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    define: {
      timestamps: true,
      underscored: false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connecté avec succès');

    // Sync all models (create tables if not exist)
    await sequelize.sync({ alter: false });
    console.log('✅ Tables synchronisées');
  } catch (error) {
    console.error('❌ Erreur connexion MySQL:', error.message);
    console.error('\n💡 Vérifiez que XAMPP/WAMP est démarré et que la BDD "bencadi" existe.');
    console.error('   Créez-la dans phpMyAdmin : CREATE DATABASE bencadi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n');
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
