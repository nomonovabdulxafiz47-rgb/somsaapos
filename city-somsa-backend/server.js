const express = require('express');
const cors = require('cors');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const adapter = new FileSync(path.join(__dirname, 'data/db.json'));
const db = low(adapter);

db.defaults({
  users: [
    { phone: '9989056657887', passHash: '56657887', role: 'tekshiruvchi', name: 'Bosh Admin', isSuperAdmin: true, subStatus: 'free' }
  ],
  somsaTypes: [
    { id: 1, name: "Mol go'shtli", price: 10000 },
    { id: 2, name: "Qo'y go'shtli", price: 12000 },
    { id: 3, name: "Avashnoy", price: 6000 },
    { id: 4, name: "Qiyma", price: 8000 },
    { id: 5, name: "Kartoshkali", price: 5000 },
    { id: 6, name: "Qovoqli", price: 5000 },
    { id: 7, name: "Tovuqli", price: 8000 }
  ],
  productionLogs: [],
  salesLogs: [],
  auditRequests: [],
  expenseLogs: [],
  adminNotifications: [],
  appSubSettings: { price: 10000, cardNumber: '0000 0000 0000 0000', cardOwner: 'Bosh Admin' },
  crmExpensesVal: 0,
  cardNumber: ''
}).write();

app.get('/api/data', (req, res) => {
  const data = db.getState();
  res.json({ success: true, data });
});

app.post('/api/users', (req, res) => {
  db.set('users', req.body).write();
  res.json({ success: true });
});

app.post('/api/production', (req, res) => {
  db.set('productionLogs', req.body).write();
  res.json({ success: true });
});

app.post('/api/sales', (req, res) => {
  db.set('salesLogs', req.body).write();
  res.json({ success: true });
});

app.post('/api/expenses', (req, res) => {
  db.set('expenseLogs', req.body).write();
  res.json({ success: true });
});

app.post('/api/audit', (req, res) => {
  db.set('auditRequests', req.body).write();
  res.json({ success: true });
});

app.post('/api/notifications', (req, res) => {
  db.set('adminNotifications', req.body).write();
  res.json({ success: true });
});

app.post('/api/settings', (req, res) => {
  const { somsaTypes, appSubSettings, crmExpensesVal, cardNumber } = req.body;
  if (somsaTypes) db.set('somsaTypes', somsaTypes).write();
  if (appSubSettings) db.set('appSubSettings', appSubSettings).write();
  if (crmExpensesVal !== undefined) db.set('crmExpensesVal', crmExpensesVal).write();
  if (cardNumber !== undefined) db.set('cardNumber', cardNumber).write();
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server ishga tushdi: ${PORT}-port`);
});
