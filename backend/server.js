// Load environment variables from .env file (must be first)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Run catalog sync auto-generator if products_catalog.js is missing
const catalogScriptPath = path.join(__dirname, '..', 'js', 'products_catalog.js');
if (!fs.existsSync(catalogScriptPath)) {
  try {
    require('../tools/sync_catalog');
  } catch (e) {
    console.warn('Auto catalog sync warning:', e.message);
  }
}

// Serve static frontend files from workspace root
app.use(express.static(path.join(__dirname, '..')));

// ----------------------------------------------------
// Admin Authentication & Authorization Middleware
// ----------------------------------------------------
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'galaxy123';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'gd_sec_token_98471205918237';

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({
      success: true,
      token: ADMIN_TOKEN,
      message: 'Admin authenticated successfully'
    });
  }
  return res.status(401).json({ error: 'Invalid admin username or password.' });
});

function requireAdminAuth(req, res, next) {
  const tokenHeader = req.headers['x-admin-auth'] || req.headers['authorization'];
  if (tokenHeader === ADMIN_TOKEN || tokenHeader === `Bearer ${ADMIN_TOKEN}`) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
}

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

app.post('/api/categories', requireAdminAuth, (req, res) => {
  const { id, name, desc, image } = req.body;
  db.run(`INSERT INTO categories (id, name, desc, image) VALUES (?, ?, ?, ?)`, 
    [id, name, desc, image], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, desc, image });
  });
});

app.delete('/api/categories/:id', requireAdminAuth, (req, res) => {
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

app.post('/api/products', requireAdminAuth, (req, res) => {
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

app.put('/api/products/:id', requireAdminAuth, (req, res) => {
  const p = req.body;
  db.run(`UPDATE products SET name=?, category=?, shortDesc=?, desc=?, price=?, offerPrice=?, image=?, gallery=?, isNew=?, inStock=?, specs=? WHERE id=?`,
    [p.name, p.category, p.shortDesc, p.desc, p.price, p.offerPrice, p.image, 
     JSON.stringify(p.gallery || []), p.isNew ? 1 : 0, p.inStock ? 1 : 0, JSON.stringify(p.specs || {}), req.params.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Updated', changes: this.changes });
  });
});

app.delete('/api/products/:id', requireAdminAuth, (req, res) => {
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
app.get('/api/orders', requireAdminAuth, (req, res) => {
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

app.put('/api/orders/:id/status', requireAdminAuth, (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE orders SET status=? WHERE id=?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated', changes: this.changes });
  });
});

// ----------------------------------------------------
// 7. Enquiries API
// ----------------------------------------------------
app.get('/api/enquiries', requireAdminAuth, (req, res) => {
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

app.put('/api/enquiries/:id/status', requireAdminAuth, (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE enquiries SET status=? WHERE id=?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated', changes: this.changes });
  });
});

// ----------------------------------------------------
// 8. Coupons API
// ----------------------------------------------------
app.get('/api/coupons', requireAdminAuth, (req, res) => {
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

// 9b. Create a Razorpay Order (Server-verified prices to prevent client-side amount tampering)
app.post('/api/payment/create-order', async (req, res) => {
  if (!razorpayInstance) {
    return res.status(503).json({
      error: 'Online payments are not configured. Please add Razorpay API keys in backend/.env'
    });
  }

  const { amount, items, couponCode, currency, receipt, notes } = req.body;

  // Validate: amount must be a positive number if provided
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount. Must be a positive number.' });
  }

  let finalAmount = amount;

  // Security Verification: If items array is provided, calculate exact total server-side
  if (Array.isArray(items) && items.length > 0) {
    try {
      const itemIds = items.map(i => i.id).filter(Boolean);
      
      if (itemIds.length > 0) {
        const placeholders = itemIds.map(() => '?').join(',');
        const dbProducts = await new Promise((resolve, reject) => {
          db.all(`SELECT id, price, offerPrice FROM products WHERE id IN (${placeholders})`, itemIds, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

        const prodMap = {};
        dbProducts.forEach(p => { prodMap[p.id] = p; });

        let calculatedSubtotal = 0;
        let totalShipping = 0;

        items.forEach(item => {
          const qty = parseInt(item.quantity, 10) || 1;
          const dbProd = prodMap[item.id];
          const unitPrice = dbProd ? (dbProd.offerPrice > 0 ? dbProd.offerPrice : dbProd.price) : (item.price || 0);
          calculatedSubtotal += unitPrice * qty;
          totalShipping += (item.shipping || 0);
        });

        let promoDiscount = 0;
        if (couponCode) {
          const coupon = await new Promise((resolve) => {
            db.get(`SELECT * FROM coupons WHERE code = ? AND isActive = 1`, [couponCode], (err, row) => {
              resolve(row || null);
            });
          });

          if (coupon && calculatedSubtotal >= (coupon.minOrderValue || 0)) {
            if (coupon.discountType === 'percentage') {
              promoDiscount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
            } else {
              promoDiscount = coupon.discountValue;
            }
          }
        }

        const serverCalculatedTotal = Math.max(0, calculatedSubtotal - promoDiscount + totalShipping);

        // Security Enforcement: Compare client-submitted amount with server-calculated total
        if (Math.abs(amount - serverCalculatedTotal) > 5) {
          console.warn(`SECURITY ALERT: Payment amount mismatch detected!`);
          console.warn(`Client submitted: ₹${amount}, Server calculated: ₹${serverCalculatedTotal}`);
          return res.status(400).json({
            error: 'Security verification failed: Order total mismatch detected. Please refresh your cart.'
          });
        }

        finalAmount = serverCalculatedTotal;
      }
    } catch (calcErr) {
      console.error('Error verifying item prices on backend:', calcErr);
      // Fail secure if price lookup crashes
      return res.status(500).json({ error: 'Failed to verify item pricing. Please try again.' });
    }
  }

  try {
    const orderOptions = {
      amount: Math.round(finalAmount * 100), // Convert rupees to paise (Razorpay expects paise)
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

// Start the server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`🚀 Galaxy Decor Backend running!`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`======================================\n`);
  });
}

module.exports = app;
