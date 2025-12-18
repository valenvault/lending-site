// server.js
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// حافظه‌ی ساده برای MVP
let orders = [];      // {id, user, collateralToken, collateralAmount, debtToken, debtAmount, termDays, status, escrowMemo}
let offers = [];      // {id, orderId, lender, apr, fixedFee, capacity, termDays, status}
let positions = [];   // {id, orderId, debtOutstanding, collateralLocked, status}
let nextOrderId = 1;
let nextOfferId = 1;
let nextPositionId = 1;

// آدرس کیف پول امانی (نمادین برای MVP)
const ESCROW_ADDRESS = 'TON_ESCROW_WALLET_ADDRESS';
const ESCROW_NOTE = 'Include memo: ORDER_ID';

app.get('/api/meta', (req, res) => {
  res.json({ escrowAddress: ESCROW_ADDRESS, escrowNote: ESCROW_NOTE });
});

app.post('/api/orders/create', (req, res) => {
  const { user, collateralToken, collateralAmount, debtToken, debtAmount, termDays } = req.body;
  if (!user || !collateralToken || !collateralAmount || !debtToken || !debtAmount || !termDays) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const id = nextOrderId++;
  const order = {
    id,
    user,
    collateralToken,
    collateralAmount: Number(collateralAmount),
    debtToken,
    debtAmount: Number(debtAmount),
    termDays: Number(termDays),
    status: 'AWAIT_COLLATERAL',
    escrowMemo: `ORDER_${id}`
  };
  orders.push(order);
  res.json({ ok: true, order });
});

// تأیید دستی دریافت وثیقه (MVP)
app.post('/api/orders/confirm-collateral', (req, res) => {
  const { orderId } = req.body;
  const order = orders.find(o => o.id === Number(orderId));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'AWAIT_COLLATERAL') return res.status(400).json({ error: 'Invalid status' });
  order.status = 'READY_FOR_OFFERS';
  res.json({ ok: true, order });
});

app.get('/api/orders/list', (req, res) => {
  res.json({ orders });
});

app.post('/api/offers/create', (req, res) => {
  const { orderId, lender, apr, fixedFee, capacity, termDays } = req.body;
  const order = orders.find(o => o.id === Number(orderId));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'READY_FOR_OFFERS') return res.status(400).json({ error: 'Order not ready for offers' });

  const id = nextOfferId++;
  const offer = {
    id,
    orderId: Number(orderId),
    lender,
    apr: Number(apr),
    fixedFee: Number(fixedFee || 0),
    capacity: Number(capacity || order.debtAmount),
    termDays: Number(termDays || order.termDays),
    status: 'OPEN'
  };
  offers.push(offer);
  res.json({ ok: true, offer });
});

app.get('/api/offers/by-order/:orderId', (req, res) => {
  const orderId = Number(req.params.orderId);
  res.json({ offers: offers.filter(x => x.orderId === orderId) });
});

app.post('/api/orders/match', (req, res) => {
  const { orderId, offerId } = req.body;
  const order = orders.find(o => o.id === Number(orderId));
  const offer = offers.find(of => of.id === Number(offerId));
  if (!order || !offer) return res.status(404).json({ error: 'Order or offer not found' });
  if (order.status !== 'READY_FOR_OFFERS') return res.status(400).json({ error: 'Order not ready' });
  if (offer.status !== 'OPEN') return res.status(400).json({ error: 'Offer not open' });

  // مچ: ایجاد پوزیشن
  const posId = nextPositionId++;
  const position = {
    id: posId,
    orderId: order.id,
    debtOutstanding: order.debtAmount,
    collateralLocked: order.collateralAmount,
    status: 'ACTIVE'
  };
  positions.push(position);
  order.status = 'MATCHED';
  offer.status = 'ACCEPTED';

  res.json({
    ok: true,
    position,
    instructionsToLender: {
      sendToUser: order.user,
      amount: order.debtAmount,
      token: order.debtToken,
      note: `ORDER_${order.id}_LOAN_TRANSFER`
    }
  });
});

app.get('/api/positions/list', (req, res) => {
  res.json({ positions });
});

// بازپرداخت ساده و آزادسازی وثیقه (دستی برای MVP)
app.post('/api/positions/repay', (req, res) => {
  const { positionId } = req.body;
  const pos = positions.find(p => p.id === Number(positionId));
  if (!pos) return res.status(404).json({ error: 'Position not found' });
  if (pos.status !== 'ACTIVE') return res.status(400).json({ error: 'Invalid status' });

  pos.debtOutstanding = 0;
  pos.status = 'REPAID';

  const order = orders.find(o => o.id === pos.orderId);
  order.status = 'COLLATERAL_RELEASED';

  res.json({
    ok: true,
    position: pos,
    releaseInstructions: {
      toUser: order.user,
      collateralAmount: order.collateralAmount,
      token: order.collateralToken,
      note: `ORDER_${order.id}_COLLATERAL_RELEASE`
    }
  });
});

app.listen(3000, () => {
  console.log('MVP lending site running on http://localhost:3000');
});
