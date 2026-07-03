const express = require('express');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const protect = require('../middleware/auth');
const router = express.Router();

// Create booking (Guest)
router.post('/', protect, async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Prevent booking your own property
    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own property' });
    }

    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    if (days <= 0) return res.status(400).json({ message: 'Invalid dates' });

    const booking = await Booking.create({
      property: propertyId,
      guest: req.user._id,
      checkIn, checkOut,
      totalPrice: days * property.pricePerNight,
      status: 'pending' // Explicitly set to pending
    }).populate('property').populate('guest', 'name email');

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my bookings (Guest)
router.get('/my', protect, async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate('property')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// Get bookings for host's properties (Host)
router.get('/host', protect, async (req, res) => {
  try {
    // Find all properties owned by this host
    const properties = await Property.find({ owner: req.user._id });
    const propertyIds = properties.map(p => p._id);

    // Find all bookings for those properties
    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('property')
      .populate('guest', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Confirm booking (Host only)
router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('property');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify the logged-in user is the property owner
    if (booking.property.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm this booking' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot confirm a ${booking.status} booking` });
    }

    booking.status = 'confirmed';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel booking (Guest or Host)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('property');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isGuest = booking.guest.toString() === req.user._id.toString();
    const isHost = booking.property.owner._id.toString() === req.user._id.toString();

    if (!isGuest && !isHost) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;