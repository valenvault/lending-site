const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'orders.json');

// Read orders from file
function readOrders() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading orders.json:', err);
    return [];
  }
}

// Write orders to file
function writeOrders(orders) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(readOrders());
});

// Create borrower order
app.post('/api/borrower', (req, res) => {
  const orders = readOrders();
  const amount = Number(req.body.amount);
  const interest = Number(req.body.interest || 0);

  if (isNaN(amount) || isNaN(interest)) {
    return res.status(400).json({ error: 'مقادیر عددی نامعتبر هستند' });
  }

  const fee = amount * 0.02; // 2% fee
  const newOrder = {
    id: orders.length + 1,
    type: 'borrower',
    ...req.body,
    feeAmount: fee.toFixed(2),
    total: (amount + (amount * interest / 100) + fee).toFixed(2),
    date: new Date().toISOString()
  };

  orders.push(newOrder);
  writeOrders(orders);
  res.json(newOrder);
});

// Create lender order
app.post('/api/lender', (req, res) => {
  const orders = readOrders();
  const amount = Number(req.body.amount);
  const interest = Number(req.body.interest || 0);

  if (isNaN(amount) || isNaN(interest)) {
    return res.status(400).json({ error: 'مقادیر عددی نامعتبر هستند' });
  }

  const fee = amount * 0.02; // 2% fee
  const newOrder = {
    id: orders.length + 1,
    type: 'lender',
    ...req.body,
    feeAmount: fee.toFixed(2),
    total: (amount + (amount * interest / 100) + fee).toFixed(2),
    date: new Date().toISOString()
  };

  orders.push(newOrder);
  writeOrders(orders);
  res.json(newOrder);
});

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
