const express = require('express');
const router = express.Router();

// Returns exchange rates relative to GHS
// Uses free exchangerate-api or falls back to static rates
router.get('/rates', async (req, res) => {
  try {
    // Detect country from IP using free service
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    let country = 'GH';
    let currency = 'GHS';

    try {
      // Try IP geolocation
      if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        const geo = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
        const geoData = await geo.json();
        country = geoData.countryCode || 'GH';
      }
    } catch (_) {}

    // Map country to currency
    const currencyMap = {
      US: 'USD', GB: 'GBP', EU: 'EUR', NG: 'NGN', ZA: 'ZAR',
      KE: 'KES', GH: 'GHS', CN: 'CNY', CA: 'CAD', AU: 'AUD'
    };
    currency = currencyMap[country] || 'USD';

    // Static fallback rates (GHS base) — update periodically
    const rates = { GHS: 1, USD: 0.067, GBP: 0.053, EUR: 0.062, NGN: 103, ZAR: 1.25, KES: 8.7, CNY: 0.49, CAD: 0.092, AUD: 0.104 };
    const symbols = { GHS: 'GHS', USD: '$', GBP: '£', EUR: '€', NGN: '₦', ZAR: 'R', KES: 'KSh', CNY: '¥', CAD: 'C$', AUD: 'A$' };

    // Try live rates
    try {
      const liveRes = await fetch(`https://open.er-api.com/v6/latest/GHS`);
      const liveData = await liveRes.json();
      if (liveData.rates) {
        Object.assign(rates, liveData.rates);
        rates.GHS = 1;
      }
    } catch (_) {}

    res.json({ country, currency, rate: rates[currency] || 1, symbol: symbols[currency] || currency, rates });
  } catch (e) {
    res.json({ country: 'GH', currency: 'GHS', rate: 1, symbol: 'GHS', rates: { GHS: 1 } });
  }
});

module.exports = router;
