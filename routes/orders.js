const express = require('express');
const { query, run } = require('../database');
const { sendOrderConfirmation } = require('../mailer');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId && !req.body?.guestEmail) return res.status(401).json({ error: 'Auth required' });
  next();
}

// Initialize payment — returns Paystack authorization URL
router.post('/initialize', async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (!cart.length) return res.status(400).json({ error: 'Cart is empty' });

    const { email, name, phone, address, city } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Name and email required' });

    let total = 0;
    cart.forEach(item => {
      const p = query('SELECT price_ghs FROM products WHERE id=?', [item.productId])[0];
      if (p) total += p.price_ghs * item.quantity;
    });

    const ref = 'EVS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Create pending order
    const order = run(
      'INSERT INTO orders (order_ref,user_id,email,total_ghs,shipping_name,shipping_email,shipping_phone,shipping_address,shipping_city) VALUES (?,?,?,?,?,?,?,?,?)',
      [ref, req.session.userId || null, email, +total.toFixed(2), name, email, phone || '', address || '', city || '']
    );

    cart.forEach(item => {
      const p = query('SELECT price_ghs FROM products WHERE id=?', [item.productId])[0];
      if (p) run('INSERT INTO order_items (order_id,product_id,quantity,price_ghs) VALUES (?,?,?,?)',
        [order.lastID, item.productId, item.quantity, p.price_ghs]);
    });

    // Store order ref in session for verification
    req.session.pendingOrderRef = ref;

    // Initialize Paystack
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer sk_test_placeholder_replace_with_secret_key`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: Math.round(total * 100), // kobo
        currency: 'GHS',
        reference: ref,
        callback_url: `${req.protocol}://${req.get('host')}/api/orders/verify`,
        metadata: { order_id: order.lastID, customer_name: name }
      })
    });

    const psData = await paystackRes.json();
    if (!psData.status) return res.status(400).json({ error: psData.message || 'Payment init failed' });

    res.json({ success: true, authorization_url: psData.data.authorization_url, reference: ref });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Verify payment after redirect
router.get('/verify', async (req, res) => {
  const { reference } = req.query;
  if (!reference) return res.redirect('/?payment=failed');
  try {
    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { 'Authorization': `Bearer sk_test_placeholder_replace_with_secret_key` }
    });
    const data = await psRes.json();
    if (data.data?.status === 'success') {
      run('UPDATE orders SET payment_status=?,status=?,paystack_ref=? WHERE order_ref=?',
        ['paid', 'processing', data.data.id, reference]);
      // Send confirmation email
      const orders = query('SELECT * FROM orders WHERE order_ref=?', [reference]);
      if (orders.length) {
        const order = orders[0];
        const items = query(`SELECT oi.*, p.name, p.sku FROM order_items oi JOIN products p ON oi.product_id=p.id WHERE oi.order_id=?`, [order.id]);
        sendOrderConfirmation(order, items).catch(() => {});
      }
      // Clear cart
      req.session.cart = [];
      return res.redirect(`/?payment=success&ref=${reference}`);
    }
    res.redirect(`/?payment=failed&ref=${reference}`);
  } catch (e) {
    res.redirect('/?payment=failed');
  }
});

router.get('/my', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Login required' });
  const orders = query('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC', [req.session.userId]);
  const enriched = orders.map(o => {
    const items = query(`SELECT oi.*, p.name, p.sku FROM order_items oi JOIN products p ON oi.product_id=p.id WHERE oi.order_id=?`, [o.id]);
    return { ...o, items };
  });
  res.json({ orders: enriched });
});

module.exports = router;
