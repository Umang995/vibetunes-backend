const express = require('express');
const { detectMood, healthCheck } = require('../controllers/moodController');

const router = express.Router();

// Health check endpoint
router.get('/test', healthCheck);

// Mood detection endpoint
router.post('/detectMood', detectMood);

module.exports = router;
