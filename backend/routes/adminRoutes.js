const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.use(protect, roleCheck('admin'));

router.get('/stats', async (req, res) => {
  const users = await User.countDocuments();
  const properties = await Property.countDocuments();
  const bookings = await Booking.countDocuments();
  res.json({ users, properties, bookings });
});

router.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;