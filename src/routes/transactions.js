const express = require('express');
const {
  getTransactions,
  createTransaction,
  getSummary,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Transaction routes
router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/summary', getSummary);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;