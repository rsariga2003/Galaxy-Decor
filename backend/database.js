const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'galaxy.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to the SQLite database.');

// Initialize tables synchronously in the queue
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
});

module.exports = db;
