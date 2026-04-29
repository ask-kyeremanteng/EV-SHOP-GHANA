// products.js
const express = require('express');
const { query } = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  const { category, search, sort, featured } = req.query;
  let sql = `SELECT p.*, c.name as cat_name, c.slug as cat_slug, c.icon as cat_icon
             FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
  const params = [];
  if (category) { sql += ' AND c.slug=?'; params.push(category); }
  if (featured) { sql += ' AND p.featured=1'; }
  if (search) { sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  const sortMap = { 'price-asc': 'p.price_ghs ASC', 'price-desc': 'p.price_ghs DESC', 'newest': 'p.created_at DESC' };
  sql += ` ORDER BY ${sortMap[sort] || 'p.featured DESC, p.id DESC'}`;
  res.json({ products: query(sql, params) });
});
router.get('/categories', (req, res) => res.json({ categories: query('SELECT * FROM categories') }));
router.get('/:id', (req, res) => {
  const p = query(`SELECT p.*, c.name as cat_name, c.slug as cat_slug FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=?`, [req.params.id]);
  if (!p.length) return res.status(404).json({ error: 'Not found' });
  res.json({ product: p[0] });
});

module.exports = router;
