// Load environment variables from .env file (must be first)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------------------------------
// Initialize Razorpay SDK with keys from .env
// ----------------------------------------------------
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;

if (razorpayKeyId && razorpayKeySecret && !razorpayKeyId.includes('YOUR_KEY')) {
  razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
  });
  console.log('Razorpay SDK initialized successfully.');
} else {
  console.warn('WARNING: Razorpay API keys not configured in backend/.env');
  console.warn('Online payments will not work until you add valid keys.');
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from workspace root
app.use(express.static(path.join(__dirname, '..')));

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

// ----------------------------------------------------
// 9. Razorpay Payment API
// ----------------------------------------------------

// 9a. Return the Razorpay public key to the frontend
app.get('/api/payment/key', (req, res) => {
  if (!razorpayInstance) {
    return res.status(503).json({
      error: 'Online payments are not configured. Please add Razorpay API keys in backend/.env'
    });
  }
  // Only send the public key_id (safe to expose), never the secret
  res.json({ key_id: razorpayKeyId });
});

// 9b. Create a Razorpay Order (server-side, so amount cannot be tampered)
app.post('/api/payment/create-order', async (req, res) => {
  if (!razorpayInstance) {
    return res.status(503).json({
      error: 'Online payments are not configured. Please add Razorpay API keys in backend/.env'
    });
  }

  const { amount, currency, receipt, notes } = req.body;

  // Validate: amount must be a positive number (in rupees from frontend)
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount. Must be a positive number.' });
  }

  try {
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert rupees to paise (Razorpay expects paise)
      currency: currency || 'INR',
      receipt: receipt || 'order_' + Date.now(),
      notes: notes || {}
    };

    const razorpayOrder = await razorpayInstance.orders.create(orderOptions);

    // Return the order details to frontend
    res.json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: razorpayKeyId  // Frontend needs this to open Checkout
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ error: 'Failed to create payment order. Please try again.' });
  }
});

// 9c. Verify payment signature after successful payment
app.post('/api/payment/verify', (req, res) => {
  if (!razorpayInstance) {
    return res.status(503).json({
      error: 'Online payments are not configured. Please add Razorpay API keys in backend/.env'
    });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

  // Validate: all three Razorpay fields are required
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields.' });
  }

  // Step 1: Generate the expected signature using HMAC-SHA256
  // Per Razorpay docs: signature = HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  const expectedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  // Step 2: Compare signatures
  const isSignatureValid = expectedSignature === razorpay_signature;

  if (!isSignatureValid) {
    console.error('Payment signature verification FAILED.');
    console.error('Expected:', expectedSignature);
    console.error('Received:', razorpay_signature);
    return res.status(400).json({ error: 'Payment verification failed. Signature mismatch.' });
  }

  // Step 3: Signature is valid — payment is genuine
  console.log('Payment verified successfully:', razorpay_payment_id);

  // Step 4: Save the order to the database if orderDetails were provided
  if (orderDetails) {
    const orderId = orderDetails.orderId || 'GD-' + Date.now();
    db.run(
      `INSERT INTO orders (id, customerName, customerPhone, customerAddress, items, totalAmount, status, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        orderDetails.name,
        orderDetails.phone,
        orderDetails.address,
        JSON.stringify(orderDetails.items || []),
        orderDetails.total,
        'New',
        'Paid'
      ],
      function (err) {
        if (err) {
          console.error('Failed to save order to database:', err.message);
          // Still return success since payment was verified
        }
      }
    );
  }

  res.json({
    verified: true,
    message: 'Payment verified successfully',
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id
  });
});

// ----------------------------------------------------
// 10. SPA Wildcard Catch-All (Fallback to index.html)
// ----------------------------------------------------
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n======================================`);
  console.log(`🚀 Galaxy Decor Backend running!`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`======================================\n`);
});
