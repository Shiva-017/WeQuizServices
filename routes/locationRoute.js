const express = require('express');
const { trackUserLocation } = require('../controllers/locationController');
const router = express.Router();

router.post('/track', trackUserLocation);

module.exports = router;
