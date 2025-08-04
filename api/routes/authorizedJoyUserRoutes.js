const express = require('express');
const router = express.Router();
const authorizedJoyUserController = require('../controllers/authorizedJoyUserController');
const { authMiddleware } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET all authorized users
router.get('/', authorizedJoyUserController.getAllAuthorizedJoyUsers);
// GET authorized user by id
router.get('/:id', authorizedJoyUserController.getAuthorizedJoyUserById);
// POST create new authorized user
router.post('/', authorizedJoyUserController.createAuthorizedJoyUser);
// PUT update authorized user
router.put('/:id', authorizedJoyUserController.updateAuthorizedJoyUser);
// DELETE authorized user
router.delete('/:id', authorizedJoyUserController.deleteAuthorizedJoyUser);

module.exports = router; 