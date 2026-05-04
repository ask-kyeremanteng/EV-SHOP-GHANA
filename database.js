const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'evshop.db')
  : path.join(__dirname, 'evshop.db');
let db;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
    initSchema();
    saveDb();
  }
  return db;
}

function saveDb() {
  if (!db) return;
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '⚡'
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price_ghs REAL NOT NULL,
      original_price_ghs REAL,
      stock INTEGER DEFAULT 0,
      category_id INTEGER,
      sku TEXT,
      weight TEXT,
      compatibility TEXT,
      featured INTEGER DEFAULT 0,
      badge TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_ref TEXT UNIQUE,
      user_id INTEGER,
      email TEXT,
      total_ghs REAL NOT NULL,
      currency TEXT DEFAULT 'GHS',
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'unpaid',
      paystack_ref TEXT,
      shipping_name TEXT,
      shipping_email TEXT,
      shipping_phone TEXT,
      shipping_address TEXT,
      shipping_city TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      price_ghs REAL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS quote_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, email TEXT, phone TEXT,
      make TEXT, model TEXT, year TEXT,
      budget_ghs REAL, destination_port TEXT,
      notes TEXT, status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      excerpt TEXT,
      content TEXT,
      category TEXT DEFAULT 'News',
      author TEXT DEFAULT 'EV Shop GH',
      published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  seedData();
}

function seedData() {
  const cats = [
    ['Battery Systems', 'battery-systems', 'High-performance EV battery packs and management systems', '🔋'],
    ['Charging Equipment', 'charging', 'Home, portable and commercial EV chargers', '⚡'],
    ['Motors & Drivetrain', 'motors', 'Electric motors, controllers and drivetrain components', '⚙️'],
    ['Cooling Systems', 'cooling', 'Thermal management for batteries and motors', '❄️'],
    ['Accessories & Safety', 'accessories', 'EV accessories, safety gear and monitoring tools', '🛡️'],
    ['Conversion Kits', 'conversion', 'Full kits to convert ICE vehicles to electric', '🔧'],
  ];
  cats.forEach(([name, slug, desc, icon]) => {
    db.run('INSERT INTO categories (name,slug,description,icon) VALUES (?,?,?,?)', [name, slug, desc, icon]);
  });

  const products = [
    // Battery Systems
    ['LiFePO4 Battery Pack 72V 100Ah', 'Premium lithium iron phosphate battery pack with integrated BMS. Ideal for motorcycles, tuk-tuks and light EVs. 7200Wh capacity with 2000+ cycle life.', 8500, 9800, 12, 1, 'BAT-001', '28kg', 'Light EVs, Motorcycles, Tuk-tuks', 1, 'Best Seller'],
    ['BMS 48V 100A Smart Battery Management', 'Intelligent BMS with Bluetooth monitoring, over-charge, over-discharge and short circuit protection. Compatible with most Li-ion packs.', 1200, 1500, 25, 1, 'BAT-002', '1.2kg', '48V Li-ion Packs', 0, null],
    ['LiNMC Battery Module 400V 60kWh', 'Automotive-grade high-voltage battery module. Suitable for full EV conversions and solar storage. Comes with cooling channels.', 42000, null, 4, 1, 'BAT-003', '280kg', 'Full EV Conversions', 1, 'Premium'],
    // Charging
    ['7kW Home Wall Charger (Type 2)', 'Smart home EV charger with WiFi, scheduled charging, and energy monitoring. OCPP 1.6 compatible. Installation-ready for Ghana 240V supply.', 3200, 3800, 18, 2, 'CHG-001', '4.5kg', 'All Type 2 EVs', 1, 'Popular'],
    ['22kW AC Commercial Charger', 'Three-phase commercial EV charger for offices, hotels and parking lots. Dual socket, RFID access, remote management via app.', 9500, 11000, 6, 2, 'CHG-002', '12kg', 'Commercial Use', 0, null],
    ['Portable 3.5kW Travel Charger', 'Compact plug-in charger with universal adapters (Type 1, Type 2, Schuko). Perfect for Ghana power outlets.', 850, 1100, 35, 2, 'CHG-003', '2kg', 'Universal', 0, null],
    // Motors
    ['BLDC Hub Motor 3000W 72V', 'High-torque brushless DC hub motor for electric motorcycles and tricycles. IP67 rated, regenerative braking support.', 2800, 3200, 20, 3, 'MOT-001', '9kg', 'Motorcycles, Tricycles', 1, 'Top Rated'],
    ['AC Induction Motor 15kW 96V', 'Industrial-grade AC motor for EV conversions of cars and minibuses. Includes encoder and mounting flange.', 7500, null, 8, 3, 'MOT-002', '45kg', 'Car & Minibus Conversions', 0, null],
    ['Motor Controller 72V 300A MOSFET', 'Programmable BLDC/PMAC motor controller with regenerative braking, throttle mapping and PC interface.', 1800, 2200, 15, 3, 'MOT-003', '2.5kg', 'BLDC/PMAC Motors up to 300A', 0, null],
    // Cooling
    ['Battery Thermal Management Kit', 'Complete liquid cooling system for battery packs. Includes pump, coolant lines, heat exchanger and controller. Reduces thermal runaway risk significantly.', 3500, 4000, 9, 4, 'COOL-001', '6kg', 'Li-ion/LiFePO4 Packs', 0, null],
    ['EV Motor Cooling Jacket 72-96V', 'Aluminium water-cooling jacket for BLDC motors up to 15kW. Custom-fit or universal mount options.', 980, null, 22, 4, 'COOL-002', '1.8kg', 'BLDC Motors 5–15kW', 0, null],
    // Accessories
    ['EV Dashboard Display 3.5" LCD', 'All-in-one instrument cluster showing speed, battery SOC, range, power flow and trip data. CAN bus compatible.', 650, 780, 40, 5, 'ACC-001', '0.4kg', 'Most EV Systems', 1, null],
    ['High Voltage Safety Gloves 1000V', 'IEC 60903 Class 0 certified rubber insulating gloves for safe EV maintenance. Essential for working with HV systems.', 320, null, 60, 5, 'ACC-002', '0.5kg', 'Safety Equipment', 0, null],
    ['EV Multimeter & Diagnostic Kit', 'Professional diagnostic kit with DC clamp meter (0-1000A), isolation tester and CANbus scanner. Built for EV technicians.', 1450, 1700, 14, 5, 'ACC-003', '1.5kg', 'Diagnostic Equipment', 0, null],
    // Conversion
    ['Motorcycle EV Conversion Kit 72V 3kW', 'Everything to convert a 125cc motorcycle to electric. Includes motor, controller, throttle, BMS, display and wiring harness.', 5800, 6500, 7, 6, 'KIT-001', '18kg', '125cc–250cc Motorcycles', 1, 'Complete Kit'],
    ['Keke/Tricycle EV Conversion Kit', 'Full conversion kit for 3-wheel tricycles (keke napep). 72V 5kW system with 100Ah LiFePO4 battery included.', 12500, 14000, 5, 6, 'KIT-002', '55kg', '3-Wheel Tricycles', 1, 'Ghana Special'],
  ];
  products.forEach(p => {
    db.run('INSERT INTO products (name,description,price_ghs,original_price_ghs,stock,category_id,sku,weight,compatibility,featured,badge) VALUES (?,?,?,?,?,?,?,?,?,?,?)', p);
  });

  // Blog posts
  const posts = [
    ['Ghana Launches EV Policy Framework 2024', 'ghana-ev-policy-2024', 'The Government of Ghana has unveiled a comprehensive EV adoption policy targeting 10% EV penetration by 2030, with tax incentives for importers.', 'The Government of Ghana has taken a landmark step toward clean transportation by releasing its Electric Vehicle Policy Framework for 2024–2030. The policy outlines tax breaks for EV importers, investment in charging infrastructure along major highways, and a phased ban on ICE motorcycle imports by 2028.\n\nFor entrepreneurs and businesses, this represents a massive opportunity. EV Shop Ghana is positioned at the forefront of this transition, supplying parts and sourcing vehicles for Ghanaians ready to make the switch.\n\nKey highlights of the policy include zero import duty on EVs below 150kW, a 50% subsidy on commercial charging station installations, and mandatory EV quotas for government fleet procurement starting 2026.', 'Policy', 'EV Shop GH'],
    ['Top 5 EVs We Can Source for You from China', 'top-5-evs-china-2024', 'From budget city cars to premium SUVs, here are the most popular EVs we source from China for Ghanaian roads — with realistic landed costs.', 'China is producing some of the world\'s most compelling electric vehicles at price points that make sense for Ghana. Here are the top 5 we source most frequently for our customers.\n\n1. BYD Seagull — A compact city EV with 300km range, starting around $12,000 FOB. Perfect for Accra city driving.\n\n2. Chery eQ7 — Mid-size SUV with 400km NEDC range. Landed cost approximately $28,000 GHS equivalent.\n\n3. SAIC Roewe Ei5 — Estate/wagon body, popular with families. Great ground clearance for Ghana roads.\n\n4. GAC Aion S — Sedan with 500km range and fast charging. Premium feel at accessible price.\n\n5. Leapmotor T03 — Ultra-compact two-seater, ideal for delivery businesses and short commutes.\n\nFill our Get a Quote form and we\'ll source any of these with full documentation, shipping and customs clearance support.', 'Sourcing', 'EV Shop GH'],
    ['How to Maintain Your EV Battery in Ghana\'s Heat', 'ev-battery-care-ghana', 'High temperatures are the number one enemy of EV battery life. Here are 5 practical tips for Ghanaian EV owners to maximize battery longevity.', 'Ghana\'s climate, with average temperatures of 28–35°C, presents unique challenges for EV battery management. Lithium batteries degrade faster above 40°C, making thermal management critical for local owners.\n\nTip 1: Park in shade whenever possible. Direct sunlight on a parked EV can raise battery temperature by 10–15°C above ambient.\n\nTip 2: Avoid charging immediately after heavy use. Let the battery cool for 15–20 minutes before plugging in.\n\nTip 3: Never charge to 100% unless needed for a long trip. Keeping charge between 20–80% dramatically extends cycle life.\n\nTip 4: Invest in a BMS with temperature monitoring. Our Smart BMS 48V sends alerts to your phone if temperatures exceed safe thresholds.\n\nTip 5: Service your cooling system every 12 months. A failing thermal management system is the silent killer of EV batteries in hot climates.\n\nEV Shop Ghana stocks all the thermal management components you need to keep your battery healthy for years.', 'Maintenance', 'EV Shop GH'],
  ];
  posts.forEach(([title, slug, excerpt, content, category, author]) => {
    db.run('INSERT INTO blog_posts (title,slug,excerpt,content,category,author) VALUES (?,?,?,?,?,?)', [title, slug, excerpt, content, category, author]);
  });

  // Admin
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('evadmin2024', 10);
  db.run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', ['EV Shop Admin', 'admin@evshopgh.com', hash, 'admin']);
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
  const r = query('SELECT last_insert_rowid() as id');
  return { lastID: r[0]?.id || null };
}

module.exports = { getDb, query, run, saveDb };
