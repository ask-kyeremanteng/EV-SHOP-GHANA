const express = require('express');
const { query, run } = require('../database');
const router = express.Router();

function admin(req, res, next) {
  if (req.session.userRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

router.get('/stats', admin, (req, res) => {
  res.json({
    orders: query('SELECT COUNT(*) as c FROM orders')[0].c,
    revenue: query('SELECT COALESCE(SUM(total_ghs),0) as s FROM orders WHERE payment_status="paid"')[0].s,
    products: query('SELECT COUNT(*) as c FROM products')[0].c,
    users: query('SELECT COUNT(*) as c FROM users WHERE role="user"')[0].c,
    quotes: query('SELECT COUNT(*) as c FROM quote_requests WHERE status="new"')[0].c,
    recentOrders: query('SELECT o.*,u.name as uname FROM orders o LEFT JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC LIMIT 5'),
    pendingQuotes: query('SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 5'),
  });
});

router.get('/products', admin, (req, res) => res.json({ products: query('SELECT p.*,c.name as cat_name FROM products p LEFT JOIN categories c ON p.category_id=c.id ORDER BY p.id DESC') }));
router.post('/products', admin, (req, res) => {
  const { name, description, price_ghs, original_price_ghs, stock, category_id, sku, compatibility, featured, badge } = req.body;
  const r = run('INSERT INTO products (name,description,price_ghs,original_price_ghs,stock,category_id,sku,compatibility,featured,badge) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [name, description, +price_ghs, +original_price_ghs || null, +stock, +category_id, sku || '', compatibility || '', featured ? 1 : 0, badge || null]);
  res.json({ success: true, id: r.lastID });
});
router.put('/products/:id', admin, (req, res) => {
  const { name, description, price_ghs, original_price_ghs, stock, category_id, featured, badge } = req.body;
  run('UPDATE products SET name=?,description=?,price_ghs=?,original_price_ghs=?,stock=?,category_id=?,featured=?,badge=? WHERE id=?',
    [name, description, +price_ghs, +original_price_ghs || null, +stock, +category_id, featured ? 1 : 0, badge || null, req.params.id]);
  res.json({ success: true });
});
router.delete('/products/:id', admin, (req, res) => { run('DELETE FROM products WHERE id=?', [req.params.id]); res.json({ success: true }); });

router.get('/orders', admin, (req, res) => {
  const orders = query('SELECT o.*,u.name as uname FROM orders o LEFT JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC');
  res.json({ orders });
});
router.put('/orders/:id/status', admin, (req, res) => {
  run('UPDATE orders SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.json({ success: true });
});

router.get('/quotes', admin, (req, res) => res.json({ quotes: query('SELECT * FROM quote_requests ORDER BY created_at DESC') }));
router.put('/quotes/:id/status', admin, (req, res) => {
  run('UPDATE quote_requests SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.json({ success: true });
});

module.exports = router;
