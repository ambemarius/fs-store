const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Please sign in to continue' });
};

const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

router.post('/', ensureAuthenticated, createOrder);
router.get('/mine', ensureAuthenticated, getMyOrders);
router.get('/', ensureAdmin, getAllOrders);
router.patch('/:id/status', ensureAdmin, updateOrderStatus);

module.exports = router;
