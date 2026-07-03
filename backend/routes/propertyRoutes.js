const express = require('express');
const Property = require('../models/Property');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// List property (vendor/admin only)
router.post('/', protect, roleCheck('property_lister', 'admin'), async (req, res) => {
  try {
    const { title, description, location, pricePerNight, images } = req.body;
    const property = await Property.create({
      title, description, location, pricePerNight, images, owner: req.user._id
    });
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all available
router.get('/', async (req, res) => {
  const properties = await Property.find({ available: true }).populate('owner', 'name email');
  res.json(properties);
});

// Get by id
router.get('/:id', async (req, res) => {
  const property = await Property.findById(req.params.id).populate('owner', 'name email');
  if (!property) return res.status(404).json({ message: 'Not found' });
  res.json(property);
});

// Update (owner or admin)
router.put('/:id', protect, async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: 'Not found' });
  if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  Object.assign(property, req.body);
  await property.save();
  res.json(property);
});

// Delete
router.delete('/:id', protect, async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: 'Not found' });
  if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  await property.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;