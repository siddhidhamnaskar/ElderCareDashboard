const { GameScoreReport, GameDeviceScore } = require('./models');

// Test function to verify duplicate handling
async function testDuplicateGameCompletionReports() {
  try {
    console.log('🧪 Testing multiple game completion reports per day...\n');

    const deviceNumber = 'TEST-DEVICE-001';
    const today = new Date().toISOString().split('T')[0];

    // Clean up any existing test data
    await GameScoreReport.destroy({ where: { DeviceNumber: deviceNumber } });
    await GameDeviceScore.destroy({ where: { DeviceNumber: deviceNumber } });

    // Create a test game device score
    const gameDeviceScore = await GameDeviceScore.create({
      DeviceNumber: deviceNumber,
      game_status: 'STOP',
      OkPressed: 5,
      WrongPressed: 2,
      NoPressed: 1,
      last_time: 2.5,
      avg_time: 1.8
    });

    console.log('📋 Creating first game completion report...');
    
    // Create first game completion report
    const report1 = await GameScoreReport.create({
      DeviceNumber: deviceNumber,
      ReportDate: today,
      TotalGames: 1,
      TotalOkPressed: 5,
      TotalWrongPressed: 2,
      TotalNoPressed: 1,
      AverageResponseTime: 1.8,
      FastestResponseTime: 1.8,
      SlowestResponseTime: 1.8,
      SuccessRate: 62.5,
      TotalPlayTime: 0.24,
      PeakHour: new Date().getHours().toString(),
      ReportType: 'game_completion',
      Status: 'completed',
      Notes: `Game completed at ${new Date().toLocaleTimeString()} - Final Score: 5 correct, 2 wrong, 1 missed`
    });

    console.log('✅ First report created successfully');

    console.log('\n📋 Creating second game completion report...');
    
    // Create second game completion report (should work now)
    const report2 = await GameScoreReport.create({
      DeviceNumber: deviceNumber,
      ReportDate: today,
      TotalGames: 1,
      TotalOkPressed: 8,
      TotalWrongPressed: 1,
      TotalNoPressed: 0,
      AverageResponseTime: 1.2,
      FastestResponseTime: 1.2,
      SlowestResponseTime: 1.2,
      SuccessRate: 88.89,
      TotalPlayTime: 0.18,
      PeakHour: new Date().getHours().toString(),
      ReportType: 'game_completion',
      Status: 'completed',
      Notes: `Game completed at ${new Date().toLocaleTimeString()} - Final Score: 8 correct, 1 wrong, 0 missed`
    });

    console.log('✅ Second report created successfully');

    // Verify both reports exist
    const allReports = await GameScoreReport.findAll({ 
      where: { 
        DeviceNumber: deviceNumber,
        ReportDate: today,
        ReportType: 'game_completion'
      },
      order: [['createdAt', 'ASC']]
    });

    console.log(`\n📊 Total game completion reports for ${deviceNumber} on ${today}: ${allReports.length}`);
    
    allReports.forEach((report, index) => {
      console.log(`\nReport ${index + 1}:`);
      console.log(`- Success Rate: ${report.SuccessRate}%`);
      console.log(`- Correct: ${report.TotalOkPressed}`);
      console.log(`- Wrong: ${report.TotalWrongPressed}`);
      console.log(`- Missed: ${report.TotalNoPressed}`);
      console.log(`- Notes: ${report.Notes}`);
    });

    if (allReports.length === 2) {
      console.log('\n✅ Test passed! Multiple game completion reports can be created per day.');
    } else {
      console.log('\n❌ Test failed! Expected 2 reports but found', allReports.length);
    }

    // Clean up test data
    await GameScoreReport.destroy({ where: { DeviceNumber: deviceNumber } });
    await GameDeviceScore.destroy({ where: { DeviceNumber: deviceNumber } });
    console.log('\n🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('This is a unique constraint error - the database schema needs to be updated.');
    }
  }
}

// Run the test
testDuplicateGameCompletionReports(); 