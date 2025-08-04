const mysql = require('mysql2/promise');
const config = require('./config');

async function setUserAsSuperAdmin(googleId) {
  const connection = await mysql.createConnection(config.database);
  
  try {
    // Update the user to be a super admin
    const [result] = await connection.execute(
      'UPDATE SensorUsers SET isSuperAdmin = ? WHERE google_id = ?',
      [true, googleId]
    );
    
    if (result.affectedRows > 0) {
      console.log(`✅ User ${googleId} has been set as super admin successfully!`);
    } else {
      console.log(`❌ User ${googleId} not found in the database.`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

// Get the Google ID from command line argument
const googleId = process.argv[2];

if (!googleId) {
  console.log('Usage: node set-super-admin.js <google_id>');
  console.log('Example: node set-super-admin.js 123456789012345678901');
  process.exit(1);
}

setUserAsSuperAdmin(googleId); 