const express = require('express');
const { upload } = require('../config/cloudinary');
const router = express.Router();

router.post('/', upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  
  const urls = req.files.map(file => file.path); // Cloudinary returns URL in 'path'
  res.json({ urls });
});

module.exports = router;