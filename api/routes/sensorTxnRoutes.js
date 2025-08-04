const express = require('express');
const router = express.Router();
const { getUserTransactions } = require('../controllers/sensorTxnController');
const { authMiddleware } = require('../middleware/auth');

// Get all transactions for the authenticated user
router.get('/user', authMiddleware, getUserTransactions);

module.exports = router; 