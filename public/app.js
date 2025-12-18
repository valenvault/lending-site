// public/app.js
const api = (path, opts = {}) =>
  fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json());

async function createOrder() {
  const payload = {
    user: document.getElementById('user').value.trim(),
    collateralToken: document.getElementById('collateralToken').value.trim(),
    collateralAmount: Number(document.getElementById('collateralAmount').value),
    debtToken: document.getElementById('debtToken').value.trim(),
    debtAmount: Number(document.getElementById('debtAmount').value),
    termDays: Number(document.getElementById('termDays').value)
  };
  const res = await api('/api/orders/create', { method: 'POST', body: JSON.stringify(payload) });
  document.getElementById('createOrderResult').innerText = res.error ? res.error : JSON.stringify(res.order, null, 2);
  const meta = await api('/api/meta');
  document.getElementById('escrowMeta').innerText =
    `آدرس امانی: ${meta.escrowAddress} | یادداشت انتقال: ${meta.escrowNote} | Memo سفارش: ${res.order?.escrowMemo || ''}`;
}

async function confirmCollateral() {
  const orderId = Number(document.getElementById('confirmOrderId').value);
  const res = await api('/api/orders/confirm-collateral', { method: 'POST', body: JSON.stringify({ orderId }) });
  document.getElementById('confirmResult').innerText = res.error ? res.error : JSON.stringify(res.order, null, 2);
}

async function loadOrders() {
  const res = await api('/api/orders/list');
  document.getElementById('ordersList').innerText = JSON.stringify(res.orders, null, 2);
}

async function createOffer() {
  const payload = {
    orderId: Number(document.getElementById('offerOrderId').value),
    lender: document.getElementById('lender').value.trim(),
    apr: Number(document.getElementById('apr').value),
    fixedFee: Number(document.getElementById('fixedFee').value),
    capacity: Number(document.getElementById('capacity').value),
    termDays: Number(document.getElementById('offerTermDays').value)
  };
  const res = await api('/api/offers/create', { method: 'POST', body: JSON.stringify(payload) });
  document.getElementById('offerResult').innerText = res.error ? res.error : JSON.stringify(res.offer, null, 2);
}

async function loadOffers() {
  const orderId = Number(document.getElementById('offersOrderId').value);
  const res = await api(`/api/offers/by-order/${orderId}`);
  document.getElementById('offersList').innerText = JSON.stringify(res.offers, null, 2);
}

async function matchOrder() {
  const payload = {
    orderId: Number(document.getElementById('matchOrderId').value),
    offerId: Number(document.getElementById('matchOfferId').value)
  };
  const res = await api('/api/orders/match', { method: 'POST', body: JSON.stringify(payload) });
  document.getElementById('matchResult').innerText = res.error ? res.error : JSON.stringify(res, null, 2);
}

async function repayPosition() {
  const positionId = Number(document.getElementById('repayPositionId').value);
  const res = await api('/api/positions/repay', { method: 'POST', body: JSON.stringify({ positionId }) });
  document.getElementById('repayResult').innerText = res.error ? res.error : JSON.stringify(res, null, 2);
}
