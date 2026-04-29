const express = require('express');
const session = require('express-session');
const path = require('path');
const { getDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'evshop-gh-secret-2024-kwadwo',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, secure: false }
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/currency', require('./routes/currency'));

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  await getDb();
  app.listen(PORT, () => {
    console.log(`\n⚡ EV Shop GH is running at http://localhost:${PORT}`);
    console.log(`   Admin: admin@evshopgh.com / evadmin2024\n`);
  });
}

start();
