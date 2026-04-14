require('dotenv').config();
const { connectDB } = require('./database');
const { Category } = require('../models');

// Mapping nom de catégorie → nom d'icône lucide-react
const ICON_MAP = [
  { name: 'Canapé & Salon',     icon: 'Sofa' },
  { name: 'Literie',            icon: 'BedDouble' },
  { name: 'Salle à Manger',    icon: 'UtensilsCrossed' },
  { name: 'Cuisine',           icon: 'ChefHat' },
  { name: 'Chambre',           icon: 'Bed' },
  { name: 'Salle de Bain',     icon: 'Droplets' },
  { name: 'Décoration',        icon: 'Palette' },
  { name: 'Jardin',            icon: 'Leaf' },
  { name: 'Bricolage',         icon: 'Hammer' },
  { name: 'Bureau',            icon: 'Briefcase' },
  { name: 'Bien-être & Loisir', icon: 'Activity' },
  { name: 'Carreaux',          icon: 'Grid3x3' },
  { name: 'Énergie Solaire',   icon: 'Sun' },
  { name: 'Climatisation',     icon: 'Snowflake' },
  { name: 'Ventilation',       icon: 'Wind' },
  { name: 'Groupe Électrogène', icon: 'Zap' },
  { name: 'Fauteuil',          icon: 'Armchair' },
  { name: 'Entrée & Couloir',  icon: 'DoorOpen' },
];

const migrate = async () => {
  try {
    await connectDB();
    let updated = 0;
    for (const { name, icon } of ICON_MAP) {
      const [rows] = await Category.update({ icon }, { where: { name } });
      if (rows > 0) { console.log(`[OK] ${name} → ${icon}`); updated++; }
      else { console.log(`[--] ${name} : introuvable en BDD`); }
    }
    console.log(`\n${updated}/${ICON_MAP.length} catégories mises à jour.`);
    process.exit(0);
  } catch (err) {
    console.error('[ERR]', err.message);
    process.exit(1);
  }
};

migrate();
