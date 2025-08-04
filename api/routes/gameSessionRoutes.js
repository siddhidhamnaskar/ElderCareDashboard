const express = require('express');
const router = express.Router();
const gameSessionController = require('../controllers/gameSessionController');
const { authMiddleware } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get only online devices
router.get('/online-devices', gameSessionController.getOnlineDevices);

// Create session with validation
router.post('/setup', gameSessionController.createGameSession);

// Update session settings (before game starts)
router.put('/:sessionId', gameSessionController.updateGameSession);

// Start game session
router.post('/:sessionId/start', gameSessionController.startGameSession);

// End game session (manual)
router.put('/:sessionId/end', gameSessionController.endGameSession);

// Get real-time session progress
router.get('/:sessionId/progress', gameSessionController.getSessionProgress);

// Get all sessions
router.get('/', gameSessionController.getAllSessions);

// Get session results
router.get('/:sessionId/results', gameSessionController.getSessionResults);

// Update player score during game
router.patch('/:sessionId/player/:deviceNumber/score', gameSessionController.updatePlayerScore);

module.exports = router; 