const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-mail.outlook.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'evsolutionsgh@outlook.com',
    pass: process.env.EMAIL_PASS || ''
  },
  tls: { ciphers: 'SSLv3' }
});

async function sendOrderConfirmation(order, items) {
  const itemRows = items.map(i =>
    `<tr>
      <td style="padding:10px;border-bottom:1px solid #eee;">${i.name}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">GHS ${(i.price_ghs * i.quantity).toLocaleString()}</td>
    </tr>`
  ).join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f7;margin:0;padding:40px 20px;">
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:#000;padding:32px 40px;text-align:center;">
        <div style="display:inline-block;background:#0071e3;border-radius:12px;padding:10px 18px;margin-bottom:16px;">
          <span style="color:white;font-weight:800;font-size:1.1rem;letter-spacing:-0.5px;">EV</span>
        </div>
        <h1 style="color:white;margin:0;font-size:1.4rem;font-weight:700;">Order Confirmed ⚡</h1>
        <p style="color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:0.9rem;">Thank you for your order from EV Shop GH</p>
      </div>

      <!-- Body -->
      <div style="padding:40px;">
        <p style="font-size:1rem;color:#1d1d1f;margin-bottom:8px;">Hi <strong>${order.shipping_name}</strong>,</p>
        <p style="color:#6e6e73;line-height:1.7;margin-bottom:24px;">
          Your order has been received and is being processed. Here's a summary:
        </p>

        <!-- Order Info -->
        <div style="background:#f5f5f7;border-radius:12px;padding:20px;margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6e6e73;font-size:0.85rem;">Order Reference</span>
            <span style="font-weight:700;font-size:0.85rem;">${order.order_ref}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#6e6e73;font-size:0.85rem;">Delivery to</span>
            <span style="font-weight:600;font-size:0.85rem;">${order.shipping_city || 'Ghana'}</span>
          </div>
        </div>

        <!-- Items -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background:#f5f5f7;">
              <th style="padding:10px;text-align:left;font-size:0.78rem;color:#6e6e73;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Product</th>
              <th style="padding:10px;text-align:center;font-size:0.78rem;color:#6e6e73;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
              <th style="padding:10px;text-align:right;font-size:0.78rem;color:#6e6e73;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:14px 10px;font-weight:800;font-size:1rem;">Total</td>
              <td style="padding:14px 10px;font-weight:800;font-size:1rem;text-align:right;color:#0071e3;">GHS ${parseFloat(order.total_ghs).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <p style="color:#6e6e73;line-height:1.7;font-size:0.9rem;">
          We'll send you a shipping update once your order is dispatched. For any questions, 
          reach us on <strong>WhatsApp: +233 59 477 5210</strong> or reply to this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f5f5f7;padding:24px 40px;text-align:center;border-top:1px solid #e5e5ea;">
        <p style="color:#6e6e73;font-size:0.8rem;margin:0;">
          © 2024 <strong>EV Shop GH</strong> · evshopgh.com · evsolutionsgh@outlook.com
        </p>
        <div style="margin-top:12px;">
          <a href="https://instagram.com/td_kyeremanteng" style="color:#0071e3;font-size:0.8rem;margin:0 8px;">Instagram</a>
          <a href="https://x.com/td_kyeremanteng" style="color:#0071e3;font-size:0.8rem;margin:0 8px;">X / Twitter</a>
          <a href="https://youtube.com/@sakentstudio" style="color:#0071e3;font-size:0.8rem;margin:0 8px;">YouTube</a>
        </div>
      </div>
    </div>
  </body>
  </html>`;

  try {
    await transporter.sendMail({
      from: `"EV Shop GH" <${process.env.EMAIL_USER || 'evsolutionsgh@outlook.com'}>`,
      to: order.shipping_email || order.email,
      subject: `Order Confirmed ⚡ — ${order.order_ref}`,
      html
    });
    // Also notify admin
    await transporter.sendMail({
      from: `"EV Shop GH" <${process.env.EMAIL_USER || 'evsolutionsgh@outlook.com'}>`,
      to: 'evsolutionsgh@outlook.com',
      subject: `New Order: ${order.order_ref} — GHS ${parseFloat(order.total_ghs).toLocaleString()}`,
      html: `<p>New order from <strong>${order.shipping_name}</strong> (${order.shipping_email})</p><p>Order Ref: <strong>${order.order_ref}</strong></p><p>Total: <strong>GHS ${parseFloat(order.total_ghs).toLocaleString()}</strong></p><p>City: ${order.shipping_city}</p>`
    });
    return true;
  } catch (e) {
    console.error('Email send error:', e.message);
    return false;
  }
}

async function sendQuoteNotification(quote) {
  try {
    await transporter.sendMail({
      from: `"EV Shop GH" <${process.env.EMAIL_USER || 'evsolutionsgh@outlook.com'}>`,
      to: 'evsolutionsgh@outlook.com',
      subject: `New Vehicle Quote Request — ${quote.make} ${quote.model}`,
      html: `
        <h2>New Vehicle Quote Request</h2>
        <p><strong>Name:</strong> ${quote.name}</p>
        <p><strong>Email:</strong> ${quote.email}</p>
        <p><strong>Phone:</strong> ${quote.phone}</p>
        <p><strong>Vehicle:</strong> ${quote.make} ${quote.model} (${quote.year})</p>
        <p><strong>Budget:</strong> GHS ${parseFloat(quote.budget_ghs || 0).toLocaleString()}</p>
        <p><strong>Port:</strong> ${quote.destination_port}</p>
        <p><strong>Notes:</strong> ${quote.notes}</p>
      `
    });
    // Confirmation to customer
    await transporter.sendMail({
      from: `"EV Shop GH" <${process.env.EMAIL_USER || 'evsolutionsgh@outlook.com'}>`,
      to: quote.email,
      subject: `Quote Request Received — EV Shop GH`,
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;">
        <h2 style="color:#0071e3;">We received your quote request ⚡</h2>
        <p>Hi <strong>${quote.name}</strong>,</p>
        <p>Thanks for your interest in sourcing a <strong>${quote.make} ${quote.model}</strong> through EV Shop GH.</p>
        <p>Our team will review your request and get back to you within <strong>24 hours</strong>.</p>
        <p>For urgent enquiries, WhatsApp us: <strong>+233 59 477 5210</strong></p>
        <p style="color:#6e6e73;font-size:0.85rem;margin-top:24px;">EV Shop GH · evshopgh.com</p>
      </div>`
    });
    return true;
  } catch (e) {
    console.error('Quote email error:', e.message);
    return false;
  }
}

module.exports = { sendOrderConfirmation, sendQuoteNotification };
