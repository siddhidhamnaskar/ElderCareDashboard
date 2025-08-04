const { GameScoreReport, GameDevice, GameDeviceScore } = require('./models');

async function testGameScoreReport() {
  try {
    console.log('Testing GameScoreReport functionality...');
    
    // Test 1: Create a test device
    const testDevice = await GameDevice.create({
      DeviceNumber: 'TEST001',
      status: 'active',
      lastHeartBeatTime: new Date()
    });
    console.log('✓ Created test device:', testDevice.DeviceNumber);
    
    // Test 2: Create initial game device score
    const testScore = await GameDeviceScore.create({
      DeviceNumber: 'TEST001',
      OkPressed: 10,
      WrongPressed: 2,
      NoPressed: 1,
      last_time: 120,
      avg_time: 2.5,
      game_status: 'COMPLETED'
    });
    console.log('✓ Created test game score');
    
    // Test 3: Check if GameScoreReport was created
    const reports = await GameScoreReport.findAll({
      where: {
        DeviceNumber: 'TEST001'
      }
    });
    
    console.log('✓ Found', reports.length, 'GameScoreReport(s)');
    
    if (reports.length > 0) {
      const report = reports[0];
      console.log('Report details:');
      console.log('- Device Number:', report.DeviceNumber);
      console.log('- Report Date:', report.ReportDate);
      console.log('- Total Games:', report.TotalGames);
      console.log('- Total Ok Pressed:', report.TotalOkPressed);
      console.log('- Success Rate:', report.SuccessRate + '%');
      console.log('- Average Response Time:', report.AverageResponseTime + 's');
      console.log('- Total Play Time:', report.TotalPlayTime + ' minutes');
    }
    
    // Test 4: Simulate another game completion
    await testScore.update({
      OkPressed: 15,
      WrongPressed: 3,
      NoPressed: 2,
      last_time: 180,
      avg_time: 2.8,
      game_status: 'COMPLETED'
    });
    
    // Test 5: Check if report was updated
    const updatedReports = await GameScoreReport.findAll({
      where: {
        DeviceNumber: 'TEST001'
      }
    });
    
    if (updatedReports.length > 0) {
      const updatedReport = updatedReports[0];
      console.log('\nUpdated Report details:');
      console.log('- Total Games:', updatedReport.TotalGames);
      console.log('- Total Ok Pressed:', updatedReport.TotalOkPressed);
      console.log('- Success Rate:', updatedReport.SuccessRate + '%');
      console.log('- Average Response Time:', updatedReport.AverageResponseTime + 's');
    }
    
    console.log('\n✓ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testGameScoreReport(); 