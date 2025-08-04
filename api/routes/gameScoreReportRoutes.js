const express = require('express');
const router = express.Router();
const gameScoreReportController = require('../controllers/gameScoreReportController');
const { authMiddleware } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all reports with pagination and filtering
router.get('/', gameScoreReportController.getAllReports);

// Get report statistics
router.get('/stats', gameScoreReportController.getReportStats);

// Get report by ID
router.get('/:id', gameScoreReportController.getReportById);

// Get reports by device number
router.get('/device/:deviceNumber', gameScoreReportController.getReportsByDevice);

// Create new report
router.post('/', gameScoreReportController.createReport);

// Generate report from game device scores
router.post('/generate', gameScoreReportController.generateReport);

// Update report by ID
router.put('/:id', gameScoreReportController.updateReport);

// Delete report by ID
router.delete('/:id', gameScoreReportController.deleteReport);

module.exports = router; 