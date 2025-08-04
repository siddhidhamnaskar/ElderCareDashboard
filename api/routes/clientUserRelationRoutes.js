const express = require('express');
const router = express.Router();
const clientUserRelationController = require('../controllers/clientUserRelationController');

// Test route
router.get('/test', clientUserRelationController.test);

// Get relations by user ID (most specific)
router.get('/user-id/:userId', clientUserRelationController.getByUserId);

// Get relations by client
router.get('/client/:clientUid', clientUserRelationController.getByClient);

// Get relations by user
router.get('/user/:userGoogleId', clientUserRelationController.getByUser);

// Get specific relation
router.get('/:clientUid/:userGoogleId', clientUserRelationController.getById);

// Create a new client-user relation
router.post('/', clientUserRelationController.create);

// Get all relations
router.get('/', clientUserRelationController.getAll);

// Update relation
router.put('/:clientUid/:userGoogleId', clientUserRelationController.update);

// Delete relation
router.delete('/:clientUid/:userGoogleId', clientUserRelationController.delete);

module.exports = router; 