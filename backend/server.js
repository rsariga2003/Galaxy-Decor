const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// 1. Store Config API
// ----------------------------------------------------
app.get('/api/store', (req, res) => {
  db.all(`SELECT * FROM store_config`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const store = {};
    rows.forEach(row => { store[row.key] = row.value; });
    res.json(store);
  });
});

// ----------------------------------------------------
// 2. Categories API
// ----------------------------------------------------
app.get('/api/categories', (req, res) => {
  db.all(`SELECT * FROM categories`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/categories', (req, res) => {
  const { id, name, desc, image } = req.body;
  db.run(`INSERT INTO categories (id, name, desc, image) VALUES (?, ?, ?, ?)`, 
    [id, name, desc, image], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, desc, image });
  });
});

app.delete('/api/categories/:id', (req, res) => {
  db.run(`DELETE FROM categories WHERE id = ?`, req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted', changes: this.changes });
  });
});

// ----------------------------------------------------
// 3. Products API
// ----------------------------------------------------
app.get('/api/products', (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Parse JSON fields
    rows.forEach(row => {
      row.gallery = row.gallery ? JSON.parse(row.gallery) : [];
      row.specs = row.specs ? JSON.parse(row.specs) : {};
      row.isNew = row.isNew === 1;
      row.inStock = row.inStock === 1;
    });
    res.json(rows);
  });
});

app.post('/api/products', (req, res) => {
  const p = req.body;
  const id = p.id || 'p_' + Date.now();
  db.run(`INSERT INTO products (id, name, category, shortDesc, desc, price, offerPrice, image, gallery, isNew, inStock, specs) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, p.name, p.category, p.shortDesc, p.desc, p.price, p.offerPrice, p.image, 
     JSON.stringify(p.gallery || []), p.isNew ? 1 : 0, p.inStock ? 1 : 0, JSON.stringify(p.specs || {})], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, ...p });
  });
});

app.put('/api/products/:id', (req, res) => {
  const p = req.body;
  db.run(`UPDATE products SET name=?, category=?, shortDesc=?, desc=?, price=?, offerPrice=?, image=?, gallery=?, isNew=?, inStock=?, specs=? WHERE id=?`,
    [p.name, p.category, p.shortDesc, p.desc, p.price, p.offerPrice, p.image, 
     JSON.stringify(p.gallery || []), p.isNew ? 1 : 0, p.inStock ? 1 : 0, JSON.stringify(p.specs || {}), req.params.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Updated', changes: this.changes });
  });
});

app.delete('/api/products/:id', (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`, req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted', changes: this.changes });
  });
});

// ----------------------------------------------------
// 4. Interior Solutions API
// ----------------------------------------------------
app.get('/api/solutions', (req, res) => {
  db.all(`SELECT * FROM interior_solutions`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(row => { row.features = row.features ? JSON.parse(row.features) : []; });
    res.json(rows);
  });
});

// ----------------------------------------------------
// 5. Reviews API
// ----------------------------------------------------
app.get('/api/reviews', (req, res) => {
  db.all(`SELECT * FROM reviews`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ----------------------------------------------------
// 6. Orders API
// ----------------------------------------------------
app.get('/api/orders', (req, res) => {
  db.all(`SELECT * FROM orders ORDER BY createdAt DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(row => { row.items = row.items ? JSON.parse(row.items) : []; });
    res.json(rows);
  });
});

app.post('/api/orders', (req, res) => {
  const o = req.body;
  const id = o.id || 'ORD' + Date.now();
  db.run(`INSERT INTO orders (id, customerName, customerPhone, customerAddress, items, totalAmount, status, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, o.customerName, o.customerPhone, o.customerAddress, JSON.stringify(o.items || []), o.totalAmount, o.status || 'Pending', o.paymentStatus || 'Pending'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, ...o });
  });
});

app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE orders SET status=? WHERE id=?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated', changes: this.changes });
  });
});

// ----------------------------------------------------
// 7. Enquiries API
// ----------------------------------------------------
app.get('/api/enquiries', (req, res) => {
  db.all(`SELECT * FROM enquiries ORDER BY createdAt DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/enquiries', (req, res) => {
  const e = req.body;
  const id = e.id || 'ENQ' + Date.now();
  db.run(`INSERT INTO enquiries (id, name, email, phone, message, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, e.name, e.email, e.phone, e.message, e.status || 'New'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, ...e });
  });
});

app.put('/api/enquiries/:id/status', (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE enquiries SET status=? WHERE id=?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated', changes: this.changes });
  });
});

// ----------------------------------------------------
// 8. Coupons API
// ----------------------------------------------------
app.get('/api/coupons', (req, res) => {
  db.all(`SELECT * FROM coupons`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(row => { row.isActive = row.isActive === 1; });
    res.json(rows);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n======================================`);
  console.log(`🚀 Galaxy Decor Backend running!`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`======================================\n`);
});
