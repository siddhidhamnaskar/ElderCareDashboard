// Usage: node api/scripts/cleanupGameDevices.js
// Cleans up GameDevices table: removes duplicate DeviceNumbers (keeps lowest id), removes NULL DeviceNumbers

const db = require('../models');

async function cleanupGameDevices() {
  try {
    // Remove rows with NULL DeviceNumber
    const nullRows = await db.GameDevice.findAll({ where: { DeviceNumber: null } });
    if (nullRows.length > 0) {
      console.log(`Deleting ${nullRows.length} rows with NULL DeviceNumber...`);
      for (const row of nullRows) {
        await row.destroy();
        console.log(`Deleted row id=${row.id}`);
      }
    } else {
      console.log('No rows with NULL DeviceNumber found.');
    }

    // Find duplicates (DeviceNumber, count > 1)
    const [results] = await db.sequelize.query(`
      SELECT DeviceNumber
      FROM GameDevices
      WHERE DeviceNumber IS NOT NULL
      GROUP BY DeviceNumber
      HAVING COUNT(*) > 1
    `);
    if (results.length === 0) {
      console.log('No duplicate DeviceNumbers found.');
      return;
    }
    for (const { DeviceNumber } of results) {
      // Find all rows with this DeviceNumber, order by id
      const rows = await db.GameDevice.findAll({
        where: { DeviceNumber },
        order: [['id', 'ASC']]
      });
      // Keep the first, delete the rest
      for (let i = 1; i < rows.length; i++) {
        await rows[i].destroy();
        console.log(`Deleted duplicate DeviceNumber='${DeviceNumber}' id=${rows[i].id}`);
      }
    }
    console.log('Cleanup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

cleanupGameDevices(); 