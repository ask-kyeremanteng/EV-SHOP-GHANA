// quotes.js
const express = require('express');
const { run } = require('../database');
const { sendQuoteNotification } = require('../mailer');
const router = express.Router();

router.post('/', (req, res) => {
  const { name, email, phone, make, model, year, budget_ghs, destination_port, notes } = req.body;
  if (!name || !email || !make) return res.status(400).json({ error: 'Name, email and vehicle make required' });
  run('INSERT INTO quote_requests (name,email,phone,make,model,year,budget_ghs,destination_port,notes) VALUES (?,?,?,?,?,?,?,?,?)',
    [name, email, phone || '', make, model || '', year || '', +budget_ghs || 0, destination_port || '', notes || '']);
  sendQuoteNotification({ name, email, phone, make, model, year, budget_ghs, destination_port, notes }).catch(() => {});
  res.json({ success: true });
});

module.exports = router;
