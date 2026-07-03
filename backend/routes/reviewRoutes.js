const express = require('express');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const protect = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const hasBooked = await Booking.findOne({
      property: propertyId,
      guest: req.user._id,
      status: 'confirmed'
    });
    if (!hasBooked) return res.status(403).json({ message: 'Can only review confirmed bookings' });

    const review = await Review.create({
      property: propertyId, user: req.user._id, rating, comment
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/property/:propertyId', async (req, res) => {
  const reviews = await Review.find({ property: req.params.propertyId }).populate('user', 'name');
  res.json(reviews);
});

module.exports = router;