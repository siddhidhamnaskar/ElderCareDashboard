const { Sensor, SensorTxn, UnlinkedSensorClient, SensorUserRelation } = require('../models');
const { Op } = require('sequelize');

exports.getUserTransactions = async (req, res) => {
  try {
    // Get user ID from the authenticated user (set by auth middleware)
    const userId = req.user.google_id;
    console.log('User ID:', userId);

    // Debug: Check if there are any sensor-user relations at all
    const allRelations = await SensorUserRelation.findAll({
      limit: 5
    });
    console.log('Sample SensorUserRelations:', allRelations.map(r => ({
      user_google_id: r.user_google_id,
      sensor_serial: r.sensor_serial,
      client_uid: r.client_uid
    })));

    // Get all sensors for this user
    const sensors = await SensorUserRelation.findAll({
      where: {
        user_google_id: userId
      }
    });
    console.log('Sensors found for user:', sensors.length);
    console.log('Sensor serials:', sensors.map(s => s.sensor_serial));

    if (sensors.length === 0) {
      return res.json([]);
    }

    // Debug: Check what transactions exist in the database
    const allTransactions = await SensorTxn.findAll({
      limit: 10
    });
    console.log('Sample transactions in database:', allTransactions.map(t => ({
      id: t.id,
      sensor_serial: t.sensor_serial,
      type: t.type,
      timestamp: t.timestamp
    })));

    // Debug: Check if sensors exist for the transaction sensor serials
    const transactionSensorSerials = allTransactions.map(t => t.sensor_serial);
    const existingSensors = await Sensor.findAll({
      where: {
        serial: {
          [Op.in]: transactionSensorSerials
        }
      }
    });
    console.log('Sensors found for transaction serials:', existingSensors.length);
    console.log('Transaction sensor serials:', transactionSensorSerials);
    console.log('Existing sensor serials:', existingSensors.map(s => s.serial));

    // Get all transactions for these sensors
    const transactions = await SensorTxn.findAll({
      where: {
        sensor_serial: {
          [Op.in]: sensors.map(s => s.sensor_serial)
        }
      },
      order: [['timestamp', 'DESC']]
    });
    console.log('Transactions found:', transactions.length);

    // Manually fetch sensor data for the transactions
    const sensorSerials = [...new Set(transactions.map(t => t.sensor_serial))];
    const sensorData = await Sensor.findAll({
      where: {
        serial: {
          [Op.in]: sensorSerials
        }
      },
      include: [{
        model: UnlinkedSensorClient,
        attributes: ['name']
      }]
    });

    // Create a map for quick lookup
    const sensorMap = {};
    sensorData.forEach(sensor => {
      sensorMap[sensor.serial] = sensor;
    });

    // Format the response
    const formattedTransactions = transactions.map(txn => {
      // Add null checks
      if (!sensorMap[txn.sensor_serial]) {
        console.log(`Warning: No Sensor found for transaction ${txn.id} with sensor_serial ${txn.sensor_serial}`);
        return null;
      }
      
      return {
        id: txn.id,
        sensorSerial: txn.sensor_serial,
        sensorDescription: sensorMap[txn.sensor_serial].desc,
        sensorType: sensorMap[txn.sensor_serial].type,
        clientName: sensorMap[txn.sensor_serial].UnlinkedSensorClient?.name || 'Unknown',
        status: txn.type, // Use txn.type instead of txn.status
        timestamp: txn.timestamp
      };
    }).filter(txn => txn !== null); // Remove null entries

    // console.log('Formatted transactions:', formattedTransactions.length);
    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Error fetching user transactions' });
  }
}; 