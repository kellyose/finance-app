const Transaction = require('../models/Transaction');

// Get all transactions for authenticated user
exports.getTransactions = async (req, res) => {
  try {
    console.log('GET /transactions - User ID:', req.user._id);
    
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    
    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
    
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transactions'
    });
  }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
  try {
    console.log('POST /transactions - Body:', req.body);
    console.log('User ID:', req.user._id);
    
    const { description, amount, type, category, date } = req.body;
    
    // Validation
    if (!description || amount === undefined || !type || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: description, amount, type, category, date'
      });
    }
    
    // ✅ FIX: Convert expense amounts to negative
    const finalAmount = type === 'expense' 
      ? -Math.abs(Number(amount)) 
      : Math.abs(Number(amount));
    
    const transaction = await Transaction.create({
      description,
      amount: finalAmount, // Use the corrected amount
      type,
      category,
      date: new Date(date),
      user: req.user._id
    });
    
    console.log('Created transaction:', transaction);
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction
    });
    
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating transaction'
    });
  }
};

// Get transaction summary
exports.getSummary = async (req, res) => {
  try {
    console.log('GET /transactions/summary - User ID:', req.user._id);
    
    const transactions = await Transaction.find({ user: req.user._id });
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const balance = totalIncome - totalExpenses;
    
    res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        balance,
        transactionCount: transactions.length
      }
    });
    
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching summary'
    });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    console.log(`PUT /transactions/${transactionId} - Body:`, req.body);
    console.log('User ID:', req.user._id);
    
    const { description, amount, type, category, date } = req.body;
    
    // Validation
    if (!description || amount === undefined || !type || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    let transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    // ✅ FIX: Convert expense amounts to negative
    const finalAmount = type === 'expense' 
      ? -Math.abs(Number(amount)) 
      : Math.abs(Number(amount));
    
    transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        description,
        amount: finalAmount, // Use the corrected amount
        type,
        category,
        date: new Date(date)
      },
      { new: true, runValidators: true }
    );
    
    console.log('Updated transaction:', transaction);
    
    res.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction
    });
    
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating transaction'
    });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    console.log(`DELETE /transactions/${transactionId}`);
    console.log('User ID:', req.user._id);
    
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    await transaction.deleteOne();
    
    console.log('Deleted transaction ID:', transactionId);
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      transactionId
    });
    
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting transaction'
    });
  }
};