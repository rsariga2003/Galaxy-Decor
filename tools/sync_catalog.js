/* ==========================================================================
   GALAXY DECOR - CATALOG SYNCHRONIZATION TOOL (NODE.JS)
   ========================================================================== */

const fs = require('fs');
const path = require('path');

// Target paths (relative to workspace root)
const PRODUCTS_DIR = path.join(__dirname, '../assets/products');
const OUTPUT_FILE = path.join(__dirname, '../js/products_catalog.js');

console.log('----------------------------------------------------');
console.log('🌌 GALAXY DECOR - Synchronizing Product Catalog...');
console.log('----------------------------------------------------');

// Ensure assets/products directory exists
if (!fs.existsSync(PRODUCTS_DIR)) {
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  console.log(`Created directory: ${PRODUCTS_DIR}`);
}

// Allowed image formats
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

// Clean up filenames and generate beautiful names
function formatProductName(filename) {
  let name = path.parse(filename).name;
  
  // Replace hyphens/underscores with spaces
  name = name.replace(/[-_]+/g, ' ');
  
  // Title capitalization
  return name.replace(/\b\w/g, c => c.toUpperCase());
}

// Guess category based on filename keyword matching
function determineCategory(filename) {
  const name = filename.toLowerCase();
  
  if (name.includes('sofa') || name.includes('couch') || name.includes('living') || name.includes('recliner') || name.includes('lounge')) {
    return 'living-room';
  }
  if (name.includes('bed') || name.includes('wardrobe') || name.includes('bedroom') || name.includes('dresser') || name.includes('nightstand')) {
    return 'bedroom';
  }
  if (name.includes('office') || name.includes('desk') || name.includes('chair') && (name.includes('exec') || name.includes('work') || name.includes('ergonomic'))) {
    return 'office';
  }
  if (name.includes('dining') || name.includes('restaurant') || name.includes('cafe') || name.includes('hotel')) {
    return 'dining';
  }
  if (name.includes('center') || name.includes('coffee') && name.includes('table')) {
    return 'center-tables';
  }
  if (name.includes('tea') || name.includes('poy') || name.includes('side')) {
    return 'tea-poys';
  }
  if (name.includes('gift') || name.includes('box') || name.includes('present')) {
    return 'gift-items';
  }
  if (name.includes('show') || name.includes('piece') || name.includes('statue') || name.includes('sculpture')) {
    return 'showpieces';
  }
  if (name.includes('fountain') || name.includes('water') || name.includes('aquarium')) {
    return 'fountains';
  }
  if (name.includes('vase') || name.includes('flower') || name.includes('pot')) {
    return 'vases';
  }
  if (name.includes('accessory') || name.includes('cushion') || name.includes('rug') || name.includes('mat')) {
    return 'decor-accessories';
  }
  if (name.includes('home') || name.includes('cabinet') || name.includes('shelf') || name.includes('stand')) {
    return 'home-furniture';
  }
  if (name.includes('commercial') || name.includes('booth') || name.includes('banquette') || name.includes('lobby')) {
    return 'commercial-furniture';
  }

  // Fallbacks based on alphabet positioning or random
  return 'home-furniture';
}

// Generate realistic pricing structures (actual and discounted offer prices) based on categories
function generatePrices(category) {
  let min = 5000;
  let max = 25000;

  switch (category) {
    case 'living-room':
      min = 35000; max = 120000;
      break;
    case 'bedroom':
      min = 40000; max = 95000;
      break;
    case 'dining':
      min = 45000; max = 110000;
      break;
    case 'office':
      min = 12000; max = 65000;
      break;
    case 'center-tables':
      min = 15000; max = 45000;
      break;
    case 'tea-poys':
      min = 6000; max = 18000;
      break;
    case 'fountains':
      min = 8000; max = 35000;
      break;
    case 'showpieces':
    case 'vases':
    case 'gift-items':
      min = 2500; max = 15000;
      break;
    default:
      min = 10000; max = 40000;
  }

  // Generate clean numbers ending in 00 or 99
  let price = Math.floor((Math.random() * (max - min) + min) / 1000) * 1000;
  if (price === 0) price = min;

  // Add 10-20% discount offer price
  let discountPct = 0.1 + Math.random() * 0.15;
  let offerPrice = Math.floor((price * (1 - discountPct)) / 100) * 100 - 1; // e.g. 29,999

  return { price, offerPrice };
}

// Generate descriptions based on category and product names
function generateDescriptions(name, category) {
  let shortDesc = `Imported premium styling, crafted for contemporary ${category.replace('-', ' ')} spaces.`;
  let desc = `This elegant ${name} showcases structural stability and high-end design styling. Directly sourced from premium manufacturers across China, Indonesia, and other leading Asian furniture hubs. Made with highly durable materials matching international interior specifications. Includes professional installation and assembly at your site.`;

  return { shortDesc, desc };
}

try {
  // Read files in assets/products
  const files = fs.readdirSync(PRODUCTS_DIR);
  
  // Filter for valid image formats
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
  });

  console.log(`Found ${imageFiles.length} image(s) in assets/products/`);

  if (imageFiles.length === 0) {
    console.log('⚠️ No product images uploaded yet. Skipping output file generation.');
    console.log('To populate the catalog: copy furniture images to assets/products/ and run this script again.');
    process.exit(0);
  }

  // Build catalog items array
  const productsCatalog = imageFiles.map((file, index) => {
    const id = `p-upload-${index + 1}`;
    const name = formatProductName(file);
    const category = determineCategory(file);
    const { price, offerPrice } = generatePrices(category);
    const { shortDesc, desc } = generateDescriptions(name, category);
    
    return {
      id,
      name,
      category,
      shortDesc,
      desc,
      price,
      offerPrice,
      image: file,
      isNew: index < 4, // Mark first 4 as new arrivals
      inStock: true,
      specs: {
        "Dimensions": "Custom showroom size (Standard fit)",
        "Material": "Premium Imported Sourcing",
        "Assembly": "Free site assembly by Galaxy Decor",
        "Sourced From": category === 'dining' || category === 'living-room' ? "Indonesia" : "China"
      }
    };
  });

  // Write catalog to js/products_catalog.js
  const fileContent = `/* ==========================================================================
   GALAXY DECOR - AUTOMATICALLY GENERATED PRODUCT CATALOG
   Generated: ${new Date().toLocaleString()}
   ========================================================================== */

window.GALAXY_PRODUCTS = ${JSON.stringify(productsCatalog, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
  console.log(`✅ Success! Generated catalog with ${productsCatalog.length} products at: ${OUTPUT_FILE}`);
  console.log('The showroom will now load your actual uploaded images dynamically.');

} catch (err) {
  console.error('❌ Error synchronizing catalog:', err.message);
  process.exit(1);
}
