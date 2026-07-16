const Order = require('../models/order');

const createOrder = async (req, res) => {
  try {
    const { items, notes } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please add at least one item to your order' });
    }

    const normalizedItems = items.map((item) => ({
      productId: item.productId || null,
      productName: item.productName,
      color: item.color || '',
      quantity: Number(item.quantity) || 1,
      sizes: Array.isArray(item.sizes)
        ? item.sizes
        : (item.size !== undefined && item.size !== null
            ? [Number(item.size)]
            : String(item.sizes || '').split(',').map((size) => Number(size.trim())).filter(Boolean)),
      price: Number(item.price) || 0,
      imageUrl: item.imageUrl || ''
    }));

    const totalAmount = normalizedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = await Order.create({
      user: req.user._id,
      items: normalizedItems,
      totalAmount,
      notes: notes || '',
      status: 'pending'
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email role').sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status || order.status;
    await order.save();

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
};
