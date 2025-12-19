const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// الگوها و توابع اعتبارسنجی
const ethAddr = /^0x[a-fA-F0-9]{40}$/;
const allowedCollateral = new Set(['BTC', 'ETH', 'USDT']);

function isValidName(name) {
  return /^[\u0600-\u06FFa-zA-Z\s]{2,50}$/.test((name || '').trim());
}

function inRange(num, min, max) {
  return Number.isFinite(num) && num >= min && num <= max;
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'orders.json');

// خواندن سفارش‌ها
function readOrders() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading orders.json:', err);
    return [];
  }
}

// نوشتن سفارش‌ها
function writeOrders(orders) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

// نمایش همه سفارش‌ها
app.get('/api/orders', (req, res) => {
  res.json(readOrders());
});

// ثبت سفارش وام‌گیرنده
app.post('/api/borrower', (req, res) => {
  const { name, wallet, amount, collateralType, collateralValue, duration, interest = 0 } = req.body;

  // اعتبارسنجی
  if (!isValidName(name)) return res.status(400).json({ error: 'نام نامعتبر' });
  if (!ethAddr.test(wallet || '')) return res.status(400).json({ error: 'کیف پول نامعتبر' });
  if (!inRange(Number(amount), 1, 1_000_000)) return res.status(400).json({ error: 'مبلغ نامعتبر' });
  if (!allowedCollateral.has(String(collateralType).toUpperCase())) return res.status(400).json({ error: 'نوع وثیقه نامعتبر' });
  if (!inRange(Number(collateralValue), 1, 10_000_000)) return res.status(400).json({ error: 'ارزش وثیقه نامعتبر' });
  if (!Number.isInteger(Number(duration)) || !inRange(Number(duration), 1, 60)) return res.status(400).json({ error: 'مدت نامعتبر' });

  // ذخیره سفارش
  const orders = readOrders();
  const fee = Number(amount) * 0.02;
  const newOrder = {
    id: orders.length + 1,
    type: 'borrower',
    ...req.body,
    feeAmount: fee.toFixed(2),
    total: (Number(amount) + (Number(amount) * Number(interest) / 100) + fee).toFixed(2),
    date: new Date().toISOString()
  };
  orders.push(newOrder);
  writeOrders(orders);
  res.json(newOrder);
});

// ثبت سفارش وام‌دهنده
app.post('/api/lender', (req, res) => {
  const { name, wallet, amount, duration, interest } = req.body;

  // اعتبارسنجی
  if (!isValidName(name)) return res.status(400).json({ error: 'نام نامعتبر' });
  if (!ethAddr.test(wallet || '')) return res.status(400).json({ error: 'کیف پول نامعتبر' });
  if (!inRange(Number(amount), 1, 1_000_000)) return res.status(400).json({ error: 'مبلغ نامعتبر' });
  if (!Number.isInteger(Number(duration)) || !inRange(Number(duration), 1, 60)) return res.status(400).json({ error: 'مدت نامعتبر' });
  if (!inRange(Number(interest), 0, 100)) return res.status(400).json({ error: 'بهره نامعتبر' });

  // ذخیره سفارش
  const orders = readOrders();
  const fee = Number(amount) * 0.02;
  const newOrder = {
    id: orders.length + 1,
    type: 'lender',
    ...req.body,
    feeAmount: fee.toFixed(2),
    total: (Number(amount) + (Number(amount) * Number(interest) / 100) + fee).toFixed(2),
    date: new Date().toISOString()
  };
  orders.push(newOrder);
  writeOrders(orders);
  res.json(newOrder);
});

// اجرای سرور
app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
