require('dotenv').config();
const { connectDB } = require('./database');
const {
  sequelize, User, Category, Product, ProductAttribute,
  ProductImage, Setting, Review,
} = require('../models');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');

const categories = [
  { name: 'Canapé & Salon',      icon: 'Sofa',            color: '#8B4513', order: 1,  description: 'Canapés, sofas et meubles de salon' },
  { name: 'Literie',              icon: 'BedDouble',       color: '#4A90D9', order: 2,  description: 'Matelas, oreillers, draps et couettes' },
  { name: 'Salle à Manger',      icon: 'UtensilsCrossed', color: '#E67E22', order: 3,  description: 'Tables, chaises et meubles de salle à manger' },
  { name: 'Cuisine',             icon: 'ChefHat',         color: '#27AE60', order: 4,  description: 'Électroménager et accessoires de cuisine' },
  { name: 'Chambre',             icon: 'Bed',             color: '#9B59B6', order: 5,  description: 'Meubles et décoration de chambre' },
  { name: 'Salle de Bain',       icon: 'Droplets',        color: '#1ABC9C', order: 6,  description: 'Meubles et accessoires salle de bain' },
  { name: 'Décoration',          icon: 'Palette',         color: '#E91E63', order: 7,  description: 'Tableaux, vases et objets décoratifs' },
  { name: 'Jardin',              icon: 'Leaf',            color: '#2ECC71', order: 8,  description: 'Meubles de jardin et extérieur' },
  { name: 'Bricolage',           icon: 'Hammer',          color: '#F39C12', order: 9,  description: 'Outils et matériaux de bricolage' },
  { name: 'Bureau',              icon: 'Briefcase',       color: '#34495E', order: 10, description: 'Meubles et accessoires de bureau' },
  { name: 'Bien-être & Loisir',  icon: 'Activity',        color: '#E74C3C', order: 11, description: 'Sport, relaxation et loisirs' },
  { name: 'Carreaux',            icon: 'Grid3x3',         color: '#95A5A6', order: 12, description: 'Carrelages et revêtements de sol' },
  { name: 'Énergie Solaire',     icon: 'Sun',             color: '#F1C40F', order: 13, description: 'Panneaux solaires et accessoires' },
  { name: 'Climatisation',       icon: 'Snowflake',       color: '#3498DB', order: 14, description: 'Climatiseurs et systèmes de refroidissement' },
  { name: 'Ventilation',         icon: 'Wind',            color: '#5DADE2', order: 15, description: 'Ventilateurs et systèmes de ventilation' },
  { name: 'Groupe Électrogène',  icon: 'Zap',             color: '#E74C3C', order: 16, description: 'Groupes électrogènes et onduleurs' },
  { name: 'Fauteuil',            icon: 'Armchair',        color: '#A0522D', order: 17, description: 'Fauteuils et chaises de relaxation' },
  { name: 'Entrée & Couloir',    icon: 'DoorOpen',        color: '#7F8C8D', order: 18, description: 'Meubles et décoration d\'entrée' },
];

const products = [
  {
    name: "Canapé d'angle moderne 5 places",
    shortDescription: "Canapé d'angle en tissu microfibre ultra-confortable",
    description: "Ce canapé d'angle 5 places en tissu microfibre de haute qualité est parfait pour les grandes familles. Structure en bois massif, mousse haute densité 35kg/m³ pour un confort exceptionnel et durable.",
    price: 285000, comparePrice: 350000, stock: 5, brand: 'BENCADİ Home',
    mainImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
    isFeatured: true, isPromo: true, promoLabel: '-19%',
    category: 'Canapé & Salon',
    colors: ['Gris', 'Beige', 'Bleu nuit'],
    tags: ['canapé', 'salon', 'angle'],
    features: ['Structure bois massif', 'Mousse HD 35kg/m³', 'Tissu microfibre'],
    rating: 4.5, numReviews: 12,
  },
  {
    name: 'Matelas mémoire de forme Premium 160x200',
    shortDescription: 'Matelas orthopédique avec technologie mémoire de forme',
    description: 'Profitez d\'un sommeil réparateur avec ce matelas mémoire de forme Premium. Technologie à 7 zones de confort, traitement anti-acariens et anti-bactérien. Hauteur 25cm.',
    price: 189000, comparePrice: 220000, stock: 8, brand: 'SleepWell',
    mainImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
    isFeatured: true, isNew: true, isPromo: true, promoLabel: '-14%',
    category: 'Literie',
    colors: ['Blanc'],
    tags: ['matelas', 'literie', 'mémoire de forme'],
    features: ['Mémoire de forme', '7 zones de confort', 'Anti-acariens', '25cm d\'épaisseur'],
    rating: 4.8, numReviews: 24,
  },
  {
    name: 'Climatiseur Inverter 1.5CV WiFi',
    shortDescription: 'Climatiseur inverter connecté avec contrôle via smartphone',
    description: 'Climatiseur inverter de 1.5CV avec technologie WiFi intégrée. Économique en énergie (classe A++), mode chauffage/refroidissement/déshumidification.',
    price: 245000, stock: 12, brand: 'CoolPro',
    mainImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',
    isFeatured: true, isNew: true,
    category: 'Climatisation',
    colors: ['Blanc'],
    tags: ['climatiseur', 'inverter', 'wifi'],
    features: ['Inverter A++', 'WiFi intégré', 'Mode chaud/froid', 'Silencieux 19dB'],
    rating: 4.6, numReviews: 8,
  },
  {
    name: 'Table à manger extensible 6-10 personnes',
    shortDescription: 'Table extensible en chêne massif, design moderne',
    description: 'Table à manger extensible en chêne massif certifié FSC. Système d\'extension permettant de passer de 6 à 10 couverts en quelques secondes.',
    price: 195000, comparePrice: 240000, stock: 6, brand: 'BENCADİ Home',
    mainImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
    isFeatured: true, isPromo: true, promoLabel: '-19%',
    category: 'Salle à Manger',
    colors: ['Chêne naturel', 'Chêne foncé', 'Blanc'],
    tags: ['table', 'salle à manger', 'extensible'],
    features: ['Chêne massif FSC', 'Extensible 6-10p', 'Vernis mat'],
    rating: 4.7, numReviews: 15,
  },
  {
    name: 'Panneau solaire 400W Monocristallin',
    shortDescription: 'Panneau solaire haute performance pour installation domestique',
    description: 'Panneau solaire monocristallin 400W avec cellules PERC de dernière génération. Rendement de 21.5%, résistant aux intempéries (certification IP68), garantie 25 ans.',
    price: 125000, stock: 20, brand: 'SolarMax',
    mainImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600',
    isNew: true, isFeatured: true,
    category: 'Énergie Solaire',
    colors: ['Noir'],
    tags: ['solaire', 'panneau', 'énergie'],
    features: ['400W monocristallin', 'Rendement 21.5%', 'IP68 étanche', 'Garantie 25 ans'],
    rating: 4.9, numReviews: 6,
  },
  {
    name: 'Fauteuil de relaxation massant électrique',
    shortDescription: 'Fauteuil massant avec chauffage lombaire et repose-pieds',
    description: 'Fauteuil de relaxation électrique avec 8 programmes de massage, chauffage lombaire réglable et repose-pieds escamotable. Télécommande incluse.',
    price: 165000, comparePrice: 195000, stock: 4, brand: 'RelaxPlus',
    mainImage: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600',
    isNew: true, isPromo: true, promoLabel: '-15%',
    category: 'Fauteuil',
    colors: ['Noir', 'Marron', 'Beige'],
    tags: ['fauteuil', 'massant', 'relaxation'],
    features: ['8 programmes massage', 'Chauffage lombaire', 'Repose-pieds', 'Télécommande'],
    rating: 4.4, numReviews: 18,
  },
  {
    name: 'Groupe électrogène silencieux 5KVA',
    shortDescription: 'Groupe électrogène insonorisé 5KVA monophasé diesel',
    description: 'Groupe électrogène diesel silencieux 5KVA monophasé avec démarrage électrique. Niveau sonore 65dB, réservoir 15L pour 8h d\'autonomie.',
    price: 385000, stock: 7, brand: 'PowerGen',
    mainImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    isFeatured: true,
    category: 'Groupe Électrogène',
    colors: ['Orange/Noir'],
    tags: ['groupe électrogène', 'générateur', 'diesel'],
    features: ['5KVA diesel', 'Silencieux 65dB', 'Démarrage électrique', '8h autonomie'],
    rating: 4.3, numReviews: 9,
  },
  {
    name: 'Ventilateur colonne 40W télécommande',
    shortDescription: 'Ventilateur colonne oscillant 3 vitesses avec minuterie',
    description: 'Ventilateur colonne élégant 40W avec oscillation automatique 90°, 3 vitesses, minuterie programmable 8h et mode nuit silencieux.',
    price: 35000, comparePrice: 42000, stock: 25, brand: 'CoolAir',
    mainImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',
    isPromo: true, promoLabel: '-17%',
    category: 'Ventilation',
    colors: ['Blanc', 'Noir'],
    tags: ['ventilateur', 'colonne'],
    features: ['40W silencieux', 'Oscillation 90°', 'Minuterie 8h', 'Télécommande'],
    rating: 4.2, numReviews: 32,
  },
];

const settingsData = [
  { key: 'siteName',               value: 'BENCADİ' },
  { key: 'siteTagline',            value: 'Votre maison, notre passion' },
  { key: 'currency',               value: 'XAF' },
  { key: 'currencySymbol',         value: 'FCFA' },
  { key: 'shippingCost',           value: 3000 },
  { key: 'freeShippingThreshold',  value: 100000 },
  { key: 'email',                  value: 'contact@bencadi.com' },
  { key: 'socialLinks',            value: { facebook: 'https://facebook.com/bencadi', instagram: 'https://instagram.com/bencadi', whatsapp: 'https://wa.me/+237600000000' } },
  { key: 'aboutUs',                value: { title: 'À propos de BENCADİ', content: 'BENCADİ est votre destination de confiance pour l\'équipement et la décoration de maison.', mission: 'Rendre chaque maison plus belle et plus confortable.', vision: 'Devenir la référence africaine de l\'équipement maison en ligne.', values: ['Qualité', 'Accessibilité', 'Service client', 'Innovation'], founded: '2024' } },
];

const seed = async () => {
  try {
    await connectDB();

    // Drop & recreate all tables
    await sequelize.sync({ force: true });
    console.log('[OK] Tables recréées');

    // Admin user
    const admin = await User.create({
      name:     process.env.ADMIN_NAME     || 'Administrateur BENCADİ',
      email:    process.env.ADMIN_EMAIL    || 'admin@bencadi.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'superadmin',
    });
    console.log(`[OK] Admin créé: ${admin.email}`);

    // Categories
    const createdCats = [];
    for (const c of categories) {
      const cat = await Category.create({ ...c, slug: slugify(c.name, { lower: true, strict: true }) });
      createdCats.push(cat);
    }
    console.log(`[OK] ${createdCats.length} catégories créées`);

    const catMap = {};
    createdCats.forEach(c => { catMap[c.name] = c.id; });

    // Products
    for (const p of products) {
      const { category, colors = [], tags = [], features = [], rating, numReviews, ...data } = p;
      data.categoryId = catMap[category];
      data.slug = slugify(data.name, { lower: true, strict: true });
      data.rating = rating || 0;
      data.numReviews = numReviews || 0;

      const product = await Product.create(data);

      // Attributes
      const attrs = [
        ...colors.map(v => ({ productId: product.id, type: 'color', value: v })),
        ...tags.map(v => ({ productId: product.id, type: 'tag', value: v })),
        ...features.map(v => ({ productId: product.id, type: 'feature', value: v })),
      ];
      if (attrs.length) await ProductAttribute.bulkCreate(attrs);
    }
    console.log(`[OK] ${products.length} produits créés`);

    // Settings
    for (const s of settingsData) {
      await Setting.create({
        key: s.key,
        value: typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value),
      });
    }
    console.log('[OK] Paramètres initialisés');

    console.log('\n[OK] Seed MySQL terminé avec succès !');
    console.log(`\nConnexion admin:`);
    console.log(`   Email    : ${admin.email}`);
    console.log(`   Password : ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    console.log(`   URL      : http://localhost:3000/admin\n`);
    process.exit(0);
  } catch (err) {
    console.error('[ERR] Erreur seed:', err.message);
    if (err.original) console.error('   SQL:', err.original.sqlMessage);
    process.exit(1);
  }
};

seed();
