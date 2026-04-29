const express = require('express');
const { query } = require('../database');
const router = express.Router();

function getCart(req) { if (!req.session.cart) req.session.cart = []; return req.session.cart; }

router.get('/', (req, res) => {
  const cart = getCart(req).map(item => {
    const p = query('SELECT * FROM products WHERE id=?', [item.productId])[0];
    return p ? { ...item, product: p } : null;
  }).filter(Boolean);
  const total = cart.reduce((s, i) => s + i.product.price_ghs * i.quantity, 0);
  res.json({ cart, total: +total.toFixed(2), count: cart.reduce((s, i) => s + i.quantity, 0) });
});

router.post('/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const cart = getCart(req);
  if (!query('SELECT id FROM products WHERE id=?', [productId]).length)
    return res.status(404).json({ error: 'Product not found' });
  const ex = cart.find(i => i.productId == productId);
  if (ex) ex.quantity += +quantity; else cart.push({ productId: +productId, quantity: +quantity });
  req.session.cart = cart;
  res.json({ success: true, count: cart.reduce((s, i) => s + i.quantity, 0) });
});

router.put('/update', (req, res) => {
  const { productId, quantity } = req.body;
  const cart = getCart(req);
  if (+quantity <= 0) req.session.cart = cart.filter(i => i.productId != productId);
  else { const it = cart.find(i => i.productId == productId); if (it) it.quantity = +quantity; }
  res.json({ success: true });
});

router.delete('/remove/:id', (req, res) => {
  req.session.cart = getCart(req).filter(i => i.productId != req.params.id);
  res.json({ success: true });
});

router.delete('/clear', (req, res) => { req.session.cart = []; res.json({ success: true }); });

module.exports = router;
