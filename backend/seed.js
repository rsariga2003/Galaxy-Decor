const fs = require('fs');
const path = require('path');
const db = require('./database');

// Read the frontend data.js file
const dataPath = path.resolve(__dirname, '../js/data.js');
let dataContent = fs.readFileSync(dataPath, 'utf-8');

// A simple trick to extract the JS object:
// Remove "window.GALAXY_DECOR_DB = " and evaluate the object
dataContent = dataContent.replace('window.GALAXY_DECOR_DB = ', 'return ');

// Evaluate safely in a function context to get the object
const getDbData = new Function(dataContent);
const initialData = getDbData();

console.log('Parsed initial data from data.js');

db.serialize(() => {
  // 1. Seed Store Config
  const store = initialData.store;
  const insertConfig = db.prepare(`INSERT OR REPLACE INTO store_config (key, value) VALUES (?, ?)`);
  for (const [key, value] of Object.entries(store)) {
    insertConfig.run(key, value);
  }
  insertConfig.finalize();

  // 2. Seed Categories
  const insertCat = db.prepare(`INSERT OR REPLACE INTO categories (id, name, desc, image) VALUES (?, ?, ?, ?)`);
  initialData.categories.forEach(cat => {
    insertCat.run(cat.id, cat.name, cat.desc, cat.image);
  });
  insertCat.finalize();

  // 3. Seed Products
  const insertProd = db.prepare(`INSERT OR REPLACE INTO products (id, name, category, shortDesc, desc, price, offerPrice, image, gallery, isNew, inStock, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  initialData.products.forEach(p => {
    insertProd.run(
      p.id, p.name, p.category, p.shortDesc, p.desc, p.price, p.offerPrice, p.image, 
      JSON.stringify(p.gallery || []), p.isNew ? 1 : 0, p.inStock ? 1 : 0, JSON.stringify(p.specs || {})
    );
  });
  insertProd.finalize();

  // 4. Seed Interior Solutions
  const insertSol = db.prepare(`INSERT OR REPLACE INTO interior_solutions (id, title, subtitle, desc, price, image, features) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  initialData.interiorSolutions.forEach(s => {
    insertSol.run(s.id, s.title, s.subtitle, s.desc, s.price, s.image, JSON.stringify(s.features || []));
  });
  insertSol.finalize();

  // 5. Seed Reviews
  const insertRev = db.prepare(`INSERT OR REPLACE INTO reviews (id, author, title, rating, text) VALUES (?, ?, ?, ?, ?)`);
  initialData.reviews.forEach(r => {
    insertRev.run(r.id, r.author, r.title, r.rating, r.text);
  });
  insertRev.finalize();

  console.log('Database seeding completed successfully!');
});

// Close database after 2 seconds to allow inserts to finish
setTimeout(() => {
  db.close();
}, 2000);
