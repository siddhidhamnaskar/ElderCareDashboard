const express = require('express');
const router = express.Router();
const gameDeviceScoreController = require('../controllers/gameDeviceScoreController');
const { authMiddleware } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all scores
router.get('/', gameDeviceScoreController.getAllScores);

// Get score by device number
router.get('/device/:deviceNumber', gameDeviceScoreController.getScoreByDevice);

// Get score statistics
router.get('/stats', gameDeviceScoreController.getScoreStats);

// Create new score record
router.post('/', gameDeviceScoreController.createScore);

// Update score by ID
router.put('/:id', gameDeviceScoreController.updateScore);

// Update score by device number
router.put('/device/:deviceNumber', gameDeviceScoreController.updateScoreByDevice);

// Increment score values
router.patch('/device/:deviceNumber/increment', gameDeviceScoreController.incrementScore);

// Delete score record
router.delete('/:id', gameDeviceScoreController.deleteScore);

module.exports = router; 