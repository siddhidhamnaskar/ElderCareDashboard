const { GameDeviceScore, GameDevice, sequelize } = require('../models');

// Get all game device scores
const getAllScores = async (req, res) => {
  try {
    const scores = await GameDeviceScore.findAll({
      attributes: ['id', 'DeviceNumber', 'OkPressed', 'WrongPressed', 'NoPressed','last_time','avg_time','game_status', 'createdAt', 'updatedAt'],
      include: [{
        model: GameDevice,
        as: 'gameDevice',
        attributes: ['DeviceNumber', 'LTime', 'PTime', 'GTime', 'NL']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Error fetching game device scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game device scores',
      error: error.message
    });
  }
};

// Get score by device number
const getScoreByDevice = async (req, res) => {
  try {
    const { deviceNumber } = req.params;
    
    const score = await GameDeviceScore.findOne({
      where: { DeviceNumber: deviceNumber },
      attributes: ['id', 'DeviceNumber', 'OkPressed', 'WrongPressed', 'NoPressed','last_time','avg_time','game_status', 'createdAt', 'updatedAt'],
      include: [{
        model: GameDevice,
        as: 'gameDevice',
        attributes: ['DeviceNumber', 'LTime', 'PTime', 'GTime', 'NL']
      }]
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score not found for this device'
      });
    }

    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    console.error('Error fetching score by device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch score',
      error: error.message
    });
  }
};

// Create new score record
const createScore = async (req, res) => {
  try {
    const { DeviceNumber, OkPressed, WrongPressed, NoPressed } = req.body;

    // Validate required fields
    if (!DeviceNumber) {
      return res.status(400).json({
        success: false,
        message: 'DeviceNumber is required'
      });
    }

    // Check if device exists
    const device = await GameDevice.findOne({
      where: { DeviceNumber }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Game device not found'
      });
    }

    // Check if score already exists for this device
    const existingScore = await GameDeviceScore.findOne({
      where: { DeviceNumber }
    });

    if (existingScore) {
      return res.status(400).json({
        success: false,
        message: 'Score record already exists for this device'
      });
    }

    const score = await GameDeviceScore.create({
      DeviceNumber,
      OkPressed: OkPressed || 0,
      WrongPressed: WrongPressed || 0,
      NoPressed: NoPressed || 0
    });

    // Fetch the created score with all attributes
    const createdScore = await GameDeviceScore.findByPk(score.id, {
      attributes: ['id', 'DeviceNumber', 'OkPressed', 'WrongPressed', 'NoPressed','last_time','avg_time','game_status', 'createdAt', 'updatedAt']
    });

    res.status(201).json({
      success: true,
      message: 'Score record created successfully',
      data: createdScore
    });
  } catch (error) {
    console.error('Error creating score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create score record',
      error: error.message
    });
  }
};

// Update score record
const updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { OkPressed, WrongPressed, NoPressed } = req.body;

    const score = await GameDeviceScore.findByPk(id);

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score record not found'
      });
    }

    await score.update({
      OkPressed: OkPressed !== undefined ? OkPressed : score.OkPressed,
      WrongPressed: WrongPressed !== undefined ? WrongPressed : score.WrongPressed,
      NoPressed: NoPressed !== undefined ? NoPressed : score.NoPressed
    });

    // Fetch the updated score with all attributes
    const updatedScore = await GameDeviceScore.findByPk(id, {
      attributes: ['id', 'DeviceNumber', 'OkPressed', 'WrongPressed', 'NoPressed','last_time','avg_time','game_status', 'createdAt', 'updatedAt']
    });

    res.json({
      success: true,
      message: 'Score updated successfully',
      data: updatedScore
    });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update score',
      error: error.message
    });
  }
};

// Update score by device number
const updateScoreByDevice = async (req, res) => {
  try {
    const { deviceNumber } = req.params;
    const { OkPressed, WrongPressed, NoPressed } = req.body;

    const score = await GameDeviceScore.findOne({
      where: { DeviceNumber: deviceNumber }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score record not found for this device'
      });
    }

    await score.update({
      OkPressed: OkPressed !== undefined ? OkPressed : score.OkPressed,
      WrongPressed: WrongPressed !== undefined ? WrongPressed : score.WrongPressed,
      NoPressed: NoPressed !== undefined ? NoPressed : score.NoPressed
    });

    // Fetch the updated score with all attributes
    const updatedScore = await GameDeviceScore.findOne({
      where: { DeviceNumber: deviceNumber },
      attributes: ['id', 'DeviceNumber', 'OkPressed', 'WrongPressed', 'NoPressed','last_time','avg_time','game_status', 'createdAt', 'updatedAt']
    });

    res.json({
      success: true,
      message: 'Score updated successfully',
      data: updatedScore
    });
  } catch (error) {
    console.error('Error updating score by device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update score',
      error: error.message
    });
  }
};

// Increment score values
const incrementScore = async (req, res) => {
  try {
    const { deviceNumber } = req.params;
    const { OkPressed, WrongPressed, NoPressed } = req.body;

    const score = await GameDeviceScore.findOne({
      where: { DeviceNumber: deviceNumber }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score record not found for this device'
      });
    }

    await score.update({
      OkPressed: score.OkPressed + (OkPressed || 0),
      WrongPressed: score.WrongPressed + (WrongPressed || 0),
      NoPressed: score.NoPressed + (NoPressed || 0)
    });

    res.json({
      success: true,
      message: 'Score incremented successfully',
      data: score
    });
  } catch (error) {
    console.error('Error incrementing score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment score',
      error: error.message
    });
  }
};

// Delete score record
const deleteScore = async (req, res) => {
  try {
    const { id } = req.params;

    const score = await GameDeviceScore.findByPk(id);

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score record not found'
      });
    }

    await score.destroy();

    res.json({
      success: true,
      message: 'Score record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete score record',
      error: error.message
    });
  }
};

// Get score statistics
const getScoreStats = async (req, res) => {
  try {
    const stats = await GameDeviceScore.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('OkPressed')), 'totalOkPressed'],
        [sequelize.fn('SUM', sequelize.col('WrongPressed')), 'totalWrongPressed'],
        [sequelize.fn('SUM', sequelize.col('NoPressed')), 'totalNoPressed'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalDevices']
      ]
    });

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error fetching score statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch score statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllScores,
  getScoreByDevice,
  createScore,
  updateScore,
  updateScoreByDevice,
  incrementScore,
  deleteScore,
  getScoreStats
}; 