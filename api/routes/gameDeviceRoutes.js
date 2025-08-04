const express = require('express');
const router = express.Router();
const gameDeviceController = require('../controllers/gameDeviceController');
const { authMiddleware } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/game-devices - Get all game devices
router.get('/', gameDeviceController.getAllGameDevices);

// GET /api/game-devices/active - Get active game devices only
router.get('/active', gameDeviceController.getActiveGameDevices);

// GET /api/game-devices/relations - Get all game device user relations
router.get('/relations', gameDeviceController.getAllGameDeviceUserRelations);

// GET /api/game-devices/:id - Get game device by ID
router.get('/:id', gameDeviceController.getGameDeviceById);

// GET /api/game-devices/number/:deviceNumber - Get game device by device number
router.get('/number/:deviceNumber', gameDeviceController.getGameDeviceByNumber);

// POST /api/game-devices - Create new game device
router.post('/', gameDeviceController.createGameDevice);

// PUT /api/game-devices/:id - Update game device by ID
router.put('/:id', gameDeviceController.updateGameDevice);

// PUT /api/game-devices/number/:deviceNumber - Update game device by device number
router.put('/number/:deviceNumber', gameDeviceController.updateGameDeviceByNumber);

// PATCH /api/game-devices/number/:deviceNumber/times - Update device times only
router.patch('/number/:deviceNumber/times', gameDeviceController.updateDeviceTimes);

// PATCH /api/game-devices/number/:deviceNumber/level - Update device level only
router.patch('/number/:deviceNumber/level', gameDeviceController.updateDeviceLevel);

// User assignment routes
// POST /api/game-devices/:deviceId/assign-user - Assign user to game device
router.post('/:deviceId/assign-user', gameDeviceController.assignUserToGameDevice);

// DELETE /api/game-devices/:deviceId/users/:userGoogleId - Remove user from game device
router.delete('/:deviceId/users/:userGoogleId', gameDeviceController.removeUserFromGameDevice);

// GET /api/game-devices/user/:userGoogleId - Get game devices by user
router.get('/user/:userGoogleId', gameDeviceController.getGameDevicesByUser);

// GET /api/game-devices/:deviceId/users - Get users by game device
router.get('/:deviceId/users', gameDeviceController.getUsersByGameDevice);

// PUT /api/game-devices/:deviceId/users/:userGoogleId/role - Update user role for game device
router.put('/:deviceId/users/:userGoogleId/role', gameDeviceController.updateUserRoleForGameDevice);

// DELETE /api/game-devices/:id - Delete game device by ID
router.delete('/:id', gameDeviceController.deleteGameDevice);

module.exports = router; 