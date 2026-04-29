const express = require('express');
const bcrypt = require('bcryptjs');
const { query, run } = require('../database');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (query('SELECT id FROM users WHERE email=?', [email]).length)
      return res.status(400).json({ error: 'Email already registered' });
    const hash = bcrypt.hashSync(password, 10);
    const r = run('INSERT INTO users (name,email,password,phone) VALUES (?,?,?,?)', [name, email, hash, phone || '']);
    req.session.userId = r.lastID;
    req.session.userName = name;
    req.session.userRole = 'user';
    res.json({ success: true, user: { id: r.lastID, name, email, role: 'user' } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = query('SELECT * FROM users WHERE email=?', [email]);
    if (!users.length || !bcrypt.compareSync(password, users[0].password))
      return res.status(400).json({ error: 'Invalid credentials' });
    const u = users[0];
    req.session.userId = u.id;
    req.session.userName = u.name;
    req.session.userRole = u.role;
    res.json({ success: true, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/logout', (req, res) => { req.session.destroy(); res.json({ success: true }); });
router.get('/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const u = query('SELECT id,name,email,role FROM users WHERE id=?', [req.session.userId]);
  res.json({ user: u[0] || null });
});

module.exports = router;
