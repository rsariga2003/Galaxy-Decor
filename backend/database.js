const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Serverless environment detection (Vercel / AWS Lambda)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);

// In Serverless environments, local root directory is read-only.
// We use /tmp/galaxy.db for writable SQLite storage, or process.env.DATABASE_PATH
const dbDir = isServerless ? '/tmp' : __dirname;
const dbPath = process.env.DATABASE_PATH || path.resolve(dbDir, 'galaxy.db');

console.log(`Connected to SQLite database at: ${dbPath} ${isServerless ? '(Vercel Serverless Mode)' : ''}`);

const db = new sqlite3.Database(dbPath);

// Initialize tables & auto-seed if empty
db.serialize(() => {
  // 1. Store Config Table (Key-Value)
  db.run(`CREATE TABLE IF NOT EXISTS store_config (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  // 2. Categories Table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT,
    desc TEXT,
    image TEXT
  )`);

  // 3. Products Table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    shortDesc TEXT,
    desc TEXT,
    price INTEGER,
    offerPrice INTEGER,
    image TEXT,
    gallery TEXT, -- JSON string array
    isNew BOOLEAN,
    inStock BOOLEAN,
    specs TEXT -- JSON string object
  )`);

  // 4. Interior Solutions Table
  db.run(`CREATE TABLE IF NOT EXISTS interior_solutions (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    desc TEXT,
    price TEXT,
    image TEXT,
    features TEXT -- JSON string array
  )`);

  // 5. Reviews Table
  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    author TEXT,
    title TEXT,
    rating INTEGER,
    text TEXT
  )`);

  // 6. Orders Table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customerName TEXT,
    customerPhone TEXT,
    customerAddress TEXT,
    items TEXT, -- JSON string array
    totalAmount INTEGER,
    status TEXT, -- 'Pending', 'Processing', 'Shipped', 'Delivered'
    paymentStatus TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 7. Enquiries Table
  db.run(`CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    message TEXT,
    status TEXT, -- 'New', 'Responded', 'Closed'
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 8. Coupons Table
  db.run(`CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT,
    discountType TEXT, -- 'percentage' or 'fixed'
    discountValue INTEGER,
    minOrderValue INTEGER,
    isActive BOOLEAN
  )`);

  console.log('Database tables initialized successfully.');
  autoSeedIfEmpty();
});

// Auto-seed initial catalog data if database is empty on serverless cold-start
function autoSeedIfEmpty() {
  db.get(`SELECT COUNT(*) as count FROM products`, [], (err, row) => {
    if (err || !row || row.count === 0) {
      console.log('Database empty — Auto-seeding initial store data...');
      try {
        const dataPath = path.resolve(__dirname, '../js/data.js');
        if (fs.existsSync(dataPath)) {
          let dataContent = fs.readFileSync(dataPath, 'utf-8');
          dataContent = dataContent.replace('window.GALAXY_DECOR_DB = ', 'return ');
          const getDbData = new Function(dataContent);
          const initialData = getDbData();

          db.serialize(() => {
            if (initialData.store) {
              const insertConfig = db.prepare(`INSERT OR REPLACE INTO store_config (key, value) VALUES (?, ?)`);
              for (const [key, value] of Object.entries(initialData.store)) {
                insertConfig.run(key, value);
              }
              insertConfig.finalize();
            }

            if (initialData.categories) {
              const insertCat = db.prepare(`INSERT OR REPLACE INTO categories (id, name, desc, image) VALUES (?, ?, ?, ?)`);
              initialData.categories.forEach(cat => insertCat.run(cat.id, cat.name, cat.desc, cat.image));
              insertCat.finalize();
            }

            if (initialData.products) {
              const insertProd = db.prepare(`INSERT OR REPLACE INTO products (id, name, category, shortDesc, desc, price, offerPrice, image, gallery, isNew, inStock, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
              initialData.products.forEach(p => {
                insertProd.run(
                  p.id, p.name, p.category, p.shortDesc, p.desc, p.price, p.offerPrice, p.image, 
                  JSON.stringify(p.gallery || []), p.isNew ? 1 : 0, p.inStock ? 1 : 0, JSON.stringify(p.specs || {})
                );
              });
              insertProd.finalize();
            }

            if (initialData.interiorSolutions) {
              const insertSol = db.prepare(`INSERT OR REPLACE INTO interior_solutions (id, title, subtitle, desc, price, image, features) VALUES (?, ?, ?, ?, ?, ?, ?)`);
              initialData.interiorSolutions.forEach(s => insertSol.run(s.id, s.title, s.subtitle, s.desc, s.price, s.image, JSON.stringify(s.features || [])));
              insertSol.finalize();
            }

            if (initialData.reviews) {
              const insertRev = db.prepare(`INSERT OR REPLACE INTO reviews (id, author, title, rating, text) VALUES (?, ?, ?, ?, ?)`);
              initialData.reviews.forEach(r => insertRev.run(r.id, r.author, r.title, r.rating, r.text));
              insertRev.finalize();
            }

            console.log('✅ Serverless Database Auto-Seeding Completed!');
          });
        }
      } catch (seedErr) {
        console.warn('Auto-seed warning:', seedErr.message);
      }
    }
  });
}

module.exports = db;
