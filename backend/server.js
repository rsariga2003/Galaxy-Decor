// Load environment variables from .env file (must be first)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { supabase, isConfigured } = require('./database');

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
const ADMIN_USER = String(process.env.ADMIN_USERNAME || 'admin').trim();
const ADMIN_PASS = String(process.env.ADMIN_PASSWORD || 'galaxy123').trim();
const ADMIN_TOKEN = String(process.env.ADMIN_TOKEN || 'gd_sec_token_98471205918237').trim();

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const cleanUser = String(username || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  if (cleanUser === ADMIN_USER.toLowerCase() && cleanPass === ADMIN_PASS) {
    return res.json({
      success: true,
      token: ADMIN_TOKEN,
      message: 'Admin authenticated successfully'
    });
  }
  return res.status(401).json({ error: 'Invalid admin username or password.' });
});

function requireAdminAuth(req, res, next) {
  const rawToken = req.headers['x-admin-auth'] || req.headers['authorization'] || '';
  const tokenHeader = String(rawToken).trim();
  if (tokenHeader === ADMIN_TOKEN || tokenHeader === `Bearer ${ADMIN_TOKEN}`) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
}

// ----------------------------------------------------
// 1. Store Config API
// ----------------------------------------------------
app.get('/api/store', async (req, res) => {
  try {
    const { data, error } = await supabase.from('store_config').select('*');
    if (error) throw error;
    const store = {};
    (data || []).forEach(row => { store[row.key] = row.value; });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/store', requireAdminAuth, async (req, res) => {
  try {
    const storeObj = req.body || {};
    const rowsToUpsert = Object.entries(storeObj).map(([key, value]) => ({
      key,
      value: String(value)
    }));
    if (rowsToUpsert.length > 0) {
      const { error } = await supabase.from('store_config').upsert(rowsToUpsert);
      if (error) throw error;
    }
    res.json({ message: 'Store profile updated', data: storeObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. Categories API
// ----------------------------------------------------
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', requireAdminAuth, async (req, res) => {
  try {
    const { id, name, desc, image } = req.body;
    const { data, error } = await supabase.from('categories').upsert([{ id, name, desc, image }]).select();
    if (error) throw error;
    res.json(data ? data[0] : { id, name, desc, image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', requireAdminAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. Products API
// ----------------------------------------------------
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    const products = (data || []).map(row => ({
      ...row,
      gallery: typeof row.gallery === 'string' ? JSON.parse(row.gallery || '[]') : (row.gallery || []),
      specs: typeof row.specs === 'string' ? JSON.parse(row.specs || '{}') : (row.specs || {}),
      isNew: Boolean(row.isNew),
      inStock: Boolean(row.inStock)
    }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', requireAdminAuth, async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || 'p_' + Date.now();
    const productRecord = {
      id,
      name: p.name,
      category: p.category,
      shortDesc: p.shortDesc,
      desc: p.desc,
      price: p.price,
      offerPrice: p.offerPrice,
      image: p.image,
      gallery: p.gallery || [],
      isNew: Boolean(p.isNew),
      inStock: Boolean(p.inStock),
      specs: p.specs || {}
    };
    const { data, error } = await supabase.from('products').upsert([productRecord]).select();
    if (error) throw error;
    res.json(data ? data[0] : productRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const p = req.body;
    const updateRecord = {
      name: p.name,
      category: p.category,
      shortDesc: p.shortDesc,
      desc: p.desc,
      price: p.price,
      offerPrice: p.offerPrice,
      image: p.image,
      gallery: p.gallery || [],
      isNew: Boolean(p.isNew),
      inStock: Boolean(p.inStock),
      specs: p.specs || {}
    };
    const { data, error } = await supabase.from('products').update(updateRecord).eq('id', req.params.id).select();
    if (error) throw error;
    res.json({ message: 'Updated', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. Interior Solutions API
// ----------------------------------------------------
app.get('/api/solutions', async (req, res) => {
  try {
    const { data, error } = await supabase.from('interior_solutions').select('*');
    if (error) throw error;
    const solutions = (data || []).map(row => ({
      ...row,
      features: typeof row.features === 'string' ? JSON.parse(row.features || '[]') : (row.features || [])
    }));
    res.json(solutions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 5. Reviews API
// ----------------------------------------------------
app.get('/api/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase.from('reviews').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const r = req.body;
    const reviewRecord = {
      id: r.id || 'rev_' + Date.now(),
      author: r.author || 'Anonymous',
      title: r.title || 'Showroom Experience',
      rating: Number(r.rating) || 5,
      text: r.text || ''
    };
    const { data, error } = await supabase.from('reviews').insert([reviewRecord]).select();
    if (error) throw error;
    res.json(data ? data[0] : reviewRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reviews/:id', requireAdminAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. Orders API
// ----------------------------------------------------
app.get('/api/orders', requireAdminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    const orders = (data || []).map(row => ({
      ...row,
      orderId: row.id || row.orderId,
      name: row.customerName || row.name || 'Customer',
      phone: row.customerPhone || row.phone || '',
      address: row.customerAddress || row.address || '',
      total: row.totalAmount !== undefined ? Number(row.totalAmount) : (Number(row.total) || 0),
      orderStatus: row.status || row.orderStatus || 'New',
      paymentStatus: row.paymentStatus || 'Pending',
      payment: row.payment || (row.paymentStatus === 'Paid' ? 'Online Gateway' : 'COD'),
      date: row.createdAt ? new Date(row.createdAt).toLocaleString() : (row.date || new Date().toLocaleString()),
      items: typeof row.items === 'string' ? JSON.parse(row.items || '[]') : (row.items || []),
      history: typeof row.history === 'string' ? JSON.parse(row.history || '[]') : (row.history || [{ status: row.status || 'New', date: row.createdAt ? new Date(row.createdAt).toLocaleString() : new Date().toLocaleString(), note: 'Order placed via website.' }])
    }));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const o = req.body;
    const orderRecord = {
      id: o.orderId || o.id || 'GD-' + Math.floor(100000 + Math.random() * 900000),
      customerName: o.name || o.customerName || 'Customer',
      customerPhone: o.phone || o.customerPhone || '',
      customerAddress: o.address || o.customerAddress || '',
      items: o.items || [],
      totalAmount: o.total !== undefined ? Number(o.total) : (Number(o.totalAmount) || 0),
      status: o.orderStatus || o.status || 'New',
      paymentStatus: o.paymentStatus || 'Pending'
    };
    const { data, error } = await supabase.from('orders').insert([orderRecord]).select();
    if (error) throw error;
    res.json(data ? data[0] : orderRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updateObj = {};
    if (status) updateObj.status = status;
    if (paymentStatus) updateObj.paymentStatus = paymentStatus;
    const { data, error } = await supabase.from('orders').update(updateObj).eq('id', req.params.id).select();
    if (error) throw error;
    res.json({ message: 'Updated', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 7. Enquiries API
// ----------------------------------------------------
app.get('/api/enquiries', requireAdminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('enquiries').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    const enquiries = (data || []).map(row => ({
      ...row,
      interest: row.interest || 'General',
      date: row.createdAt ? new Date(row.createdAt).toLocaleString() : (row.date || new Date().toLocaleString())
    }));
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/enquiries', async (req, res) => {
  try {
    const e = req.body;
    const enquiryRecord = {
      id: e.id || 'ENQ-' + Date.now(),
      name: e.name || 'Visitor',
      email: e.email || '',
      phone: e.phone || '',
      interest: e.interest || 'General',
      message: e.message || '',
      status: e.status || 'New'
    };
    const { data, error } = await supabase.from('enquiries').insert([enquiryRecord]).select();
    if (error) throw error;
    res.json(data ? data[0] : enquiryRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/enquiries/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase.from('enquiries').update({ status }).eq('id', req.params.id).select();
    if (error) throw error;
    res.json({ message: 'Updated', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/enquiries/:id', requireAdminAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('enquiries').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 8. Coupons API
// ----------------------------------------------------
app.get('/api/coupons', requireAdminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) throw error;
    const coupons = (data || []).map(row => ({
      ...row,
      isActive: Boolean(row.isActive)
    }));
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  res.json({ key_id: razorpayKeyId });
});

// 9b. Create a Razorpay Order (Server-verified prices via Supabase)
app.post('/api/payment/create-order', async (req, res) => {
  if (!razorpayInstance) {
    return res.status(503).json({
      error: 'Online payments are not configured. Please add Razorpay API keys in backend/.env'
    });
  }

  const { amount, items, couponCode, currency, receipt, notes } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount. Must be a positive number.' });
  }

  let finalAmount = amount;

  if (Array.isArray(items) && items.length > 0) {
    try {
      const itemIds = items.map(i => i.id).filter(Boolean);
      
      if (itemIds.length > 0) {
        const { data: dbProducts } = await supabase.from('products').select('id, price, offerPrice').in('id', itemIds);

        const prodMap = {};
        (dbProducts || []).forEach(p => { prodMap[p.id] = p; });

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
          const { data: coupon } = await supabase.from('coupons').select('*').eq('code', couponCode).eq('isActive', true).maybeSingle();

          if (coupon && calculatedSubtotal >= (coupon.minOrderValue || 0)) {
            if (coupon.discountType === 'percentage') {
              promoDiscount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
            } else {
              promoDiscount = coupon.discountValue;
            }
          }
        }

        const serverCalculatedTotal = Math.max(0, calculatedSubtotal - promoDiscount + totalShipping);

        if (Math.abs(amount - serverCalculatedTotal) > 5) {
          console.warn(`SECURITY ALERT: Payment amount mismatch detected!`);
          return res.status(400).json({
            error: 'Security verification failed: Order total mismatch detected. Please refresh your cart.'
          });
        }

        finalAmount = serverCalculatedTotal;
      }
    } catch (calcErr) {
      console.error('Error verifying item prices on backend:', calcErr);
      return res.status(500).json({ error: 'Failed to verify item pricing. Please try again.' });
    }
  }

  try {
    const orderOptions = {
      amount: Math.round(finalAmount * 100),
      currency: currency || 'INR',
      receipt: receipt || 'order_' + Date.now(),
      notes: notes || {}
    };

    const razorpayOrder = await razorpayInstance.orders.create(orderOptions);

    res.json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: razorpayKeyId
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ error: 'Failed to create payment order. Please try again.' });
  }
});

// 9c. Verify payment signature after successful payment
app.post('/api/payment/verify', async (req, res) => {
  if (!razorpayInstance) {
    return res.status(503).json({
      error: 'Online payments are not configured. Please add Razorpay API keys in backend/.env'
    });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields.' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  const isSignatureValid = expectedSignature === razorpay_signature;

  if (!isSignatureValid) {
    return res.status(400).json({ error: 'Payment verification failed. Signature mismatch.' });
  }

  console.log('Payment verified successfully:', razorpay_payment_id);

  if (orderDetails) {
    const orderId = orderDetails.orderId || 'GD-' + Date.now();
    try {
      await supabase.from('orders').insert([{
        id: orderId,
        customerName: orderDetails.name,
        customerPhone: orderDetails.phone,
        customerAddress: orderDetails.address,
        items: orderDetails.items || [],
        totalAmount: orderDetails.total,
        status: 'New',
        paymentStatus: 'Paid'
      }]);
    } catch (saveErr) {
      console.error('Failed to save verified order to Supabase:', saveErr.message);
    }
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
