const { GameScoreReport, GameDevice, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all game score reports
const getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, deviceNumber, reportType, status, startDate, endDate } = req.query;
    
    const whereClause = {};
    
    if (deviceNumber) {
      whereClause.DeviceNumber = deviceNumber;
    }
    
    if (reportType) {
      whereClause.ReportType = reportType;
    }
    
    if (status) {
      whereClause.Status = status;
    }
    
    if (startDate && endDate) {
      whereClause.ReportDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const reports = await GameScoreReport.findAndCountAll({
      where: whereClause,
      include: [{
        model: GameDevice,
        as: 'gameDevice',
        attributes: ['DeviceNumber', 'LTime', 'PTime', 'GTime', 'NL']
      }],
      order: [['ReportDate', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: reports.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reports.count / parseInt(limit)),
        totalItems: reports.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching game score reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game score reports',
      error: error.message
    });
  }
};

// Get report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await GameScoreReport.findByPk(id, {
      include: [{
        model: GameDevice,
        as: 'gameDevice',
        attributes: ['DeviceNumber', 'LTime', 'PTime', 'GTime', 'NL']
      }]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
};

// Get reports by device number
const getReportsByDevice = async (req, res) => {
  try {
    const { deviceNumber } = req.params;
    const { reportType, startDate, endDate } = req.query;
    
    const whereClause = { DeviceNumber: deviceNumber };
    
    if (reportType) {
      whereClause.ReportType = reportType;
    }
    
    if (startDate && endDate) {
      whereClause.ReportDate = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const reports = await GameScoreReport.findAll({
      where: whereClause,
      include: [{
        model: GameDevice,
        as: 'gameDevice',
        attributes: ['DeviceNumber', 'LTime', 'PTime', 'GTime', 'NL']
      }],
      order: [['ReportDate', 'DESC']]
    });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports by device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// Create new report
const createReport = async (req, res) => {
  try {
    const {
      DeviceNumber,
      ReportDate,
      TotalGames,
      TotalOkPressed,
      TotalWrongPressed,
      TotalNoPressed,
      AverageResponseTime,
      FastestResponseTime,
      SlowestResponseTime,
      SuccessRate,
      TotalPlayTime,
      PeakHour,
      ReportType,
      Status,
      Notes
    } = req.body;

    // Validate required fields
    if (!DeviceNumber || !ReportDate || !ReportType) {
      return res.status(400).json({
        success: false,
        message: 'DeviceNumber, ReportDate, and ReportType are required'
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

    // Check if report already exists for this device, date, and type
    const existingReport = await GameScoreReport.findOne({
      where: {
        DeviceNumber,
        ReportDate,
        ReportType
      }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Report already exists for this device, date, and type'
      });
    }

    const report = await GameScoreReport.create({
      DeviceNumber,
      ReportDate,
      TotalGames: TotalGames || 0,
      TotalOkPressed: TotalOkPressed || 0,
      TotalWrongPressed: TotalWrongPressed || 0,
      TotalNoPressed: TotalNoPressed || 0,
      AverageResponseTime,
      FastestResponseTime,
      SlowestResponseTime,
      SuccessRate,
      TotalPlayTime,
      PeakHour,
      ReportType,
      Status: Status || 'active',
      Notes
    });

    // Fetch the created report with device information
    const createdReport = await GameScoreReport.findByPk(report.id, {
      include: [{
        model: GameDevice,
        as: 'gameDevice',
        attributes: ['DeviceNumber', 'LTime', 'PTime', 'GTime', 'NL']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: createdReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: error.message
    });
  }
};

// Update report
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const report = await GameScoreReport.findByPk(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.update(updateData);

    // Fetch the updated report with device information
    const updatedReport = await GameScoreReport.findByPk(id, {
      include: [{
        model: GameDevice,
        as: 'gameDevice',
        attributes: ['DeviceNumber', 'LTime', 'PTime', 'GTime', 'NL']
      }]
    });

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
};

// Delete report
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await GameScoreReport.findByPk(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.destroy();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};

// Generate report from game device scores
const generateReport = async (req, res) => {
  try {
    const { deviceNumber, reportDate, reportType } = req.body;

    if (!deviceNumber || !reportDate || !reportType) {
      return res.status(400).json({
        success: false,
        message: 'DeviceNumber, ReportDate, and ReportType are required'
      });
    }

    // Check if device exists
    const device = await GameDevice.findOne({
      where: { DeviceNumber: deviceNumber }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Game device not found'
      });
    }

    // Check if report already exists
    const existingReport = await GameScoreReport.findOne({
      where: {
        DeviceNumber: deviceNumber,
        ReportDate: reportDate,
        ReportType: reportType
      }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Report already exists for this device, date, and type'
      });
    }

    // Here you would typically aggregate data from GameDeviceScore table
    // For now, we'll create a basic report structure
    const reportData = {
      DeviceNumber: deviceNumber,
      ReportDate: reportDate,
      ReportType: reportType,
      TotalGames: 0,
      TotalOkPressed: 0,
      TotalWrongPressed: 0,
      TotalNoPressed: 0,
      AverageResponseTime: 0,
      FastestResponseTime: 0,
      SlowestResponseTime: 0,
      SuccessRate: 0,
      TotalPlayTime: 0,
      PeakHour: '0',
      Status: 'active',
      Notes: `Auto-generated ${reportType} report for ${deviceNumber} on ${reportDate}`
    };

    const report = await GameScoreReport.create(reportData);

    // Fetch the created report with device information
    const createdReport = await GameScoreReport.findByPk(report.id, {
      include: [{
        model: GameDevice,
        as: 'gameDevice',
        attributes: ['DeviceNumber', 'LTime', 'PTime', 'GTime', 'NL']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: createdReport
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};

// Get report statistics
const getReportStats = async (req, res) => {
  try {
    const { deviceNumber, reportType, startDate, endDate } = req.query;
    
    const whereClause = {};
    
    if (deviceNumber) {
      whereClause.DeviceNumber = deviceNumber;
    }
    
    if (reportType) {
      whereClause.ReportType = reportType;
    }
    
    if (startDate && endDate) {
      whereClause.ReportDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const stats = await GameScoreReport.findAll({
      where: whereClause,
      attributes: [
        'ReportType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReports'],
        [sequelize.fn('SUM', sequelize.col('TotalGames')), 'totalGames'],
        [sequelize.fn('AVG', sequelize.col('SuccessRate')), 'avgSuccessRate'],
        [sequelize.fn('AVG', sequelize.col('AverageResponseTime')), 'avgResponseTime'],
        [sequelize.fn('SUM', sequelize.col('TotalPlayTime')), 'totalPlayTime']
      ],
      group: ['ReportType']
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching report statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllReports,
  getReportById,
  getReportsByDevice,
  createReport,
  updateReport,
  deleteReport,
  generateReport,
  getReportStats
}; 