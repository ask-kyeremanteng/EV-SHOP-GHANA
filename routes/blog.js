const express = require('express');
const { query } = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ posts: query('SELECT id,title,slug,excerpt,category,author,created_at FROM blog_posts WHERE published=1 ORDER BY created_at DESC') });
});

router.get('/:slug', (req, res) => {
  const p = query('SELECT * FROM blog_posts WHERE slug=? AND published=1', [req.params.slug]);
  if (!p.length) return res.status(404).json({ error: 'Post not found' });
  res.json({ post: p[0] });
});

module.exports = router;
