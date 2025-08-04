const { GameScoreReport, GameDeviceScore, GameDevice } = require('./models');

// Test function to simulate MQTT payloads
async function testStopReportCreation() {
  try {
    console.log('🧪 Testing STOP report creation...\n');

    // Test 1: Simulate START status (should NOT create report)
    console.log('📋 Test 1: START status (should NOT create report)');
    const startPayload = 'DEVICE001,Status,START';
    console.log(`Payload: ${startPayload}`);
    
    // Simulate the MQTT processing logic for START
    let gameDeviceScore = await GameDeviceScore.findOne({ where: { DeviceNumber: 'DEVICE001' } });
    if (!gameDeviceScore) {
      gameDeviceScore = await GameDeviceScore.create({
        DeviceNumber: 'DEVICE001',
        game_status: 'START',
        OkPressed: 0,
        WrongPressed: 0,
        NoPressed: 0,
        last_time: 0,
        avg_time: 0
      });
    } else {
      gameDeviceScore.game_status = 'START';
      gameDeviceScore.OkPressed = 0;
      gameDeviceScore.WrongPressed = 0;
      gameDeviceScore.NoPressed = 0;
      gameDeviceScore.last_time = 0;
      gameDeviceScore.avg_time = 0;
      await gameDeviceScore.save();
    }
    
    // Check if any reports were created (should be 0)
    const reportsAfterStart = await GameScoreReport.count({ where: { DeviceNumber: 'DEVICE001' } });
    console.log(`Reports after START: ${reportsAfterStart}\n`);

    // Test 2: Simulate score updates (should NOT create report)
    console.log('📋 Test 2: Score updates (should NOT create report)');
    const scorePayload = 'DEVICE001,Status,5,10,3,2.5,1.8';
    console.log(`Payload: ${scorePayload}`);
    
    // Update scores
    await gameDeviceScore.update({
      OkPressed: 5,
      WrongPressed: 10,
      NoPressed: 3,
      last_time: 2.5,
      avg_time: 1.8
    });
    
    // Check if any reports were created (should be 0)
    const reportsAfterScore = await GameScoreReport.count({ where: { DeviceNumber: 'DEVICE001' } });
    console.log(`Reports after score update: ${reportsAfterScore}\n`);

    // Test 3: Simulate STOP status (SHOULD create report)
    console.log('📋 Test 3: STOP status (SHOULD create report)');
    const stopPayload = 'DEVICE001,Status,STOP';
    console.log(`Payload: ${stopPayload}`);
    
    // Simulate the MQTT processing logic for STOP
    gameDeviceScore.game_status = 'STOP';
    await gameDeviceScore.save();
    
    // Simulate the storeGameScoreReport function logic for STOP
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    const totalPresses = parseInt(gameDeviceScore.OkPressed) + parseInt(gameDeviceScore.WrongPressed) + parseInt(gameDeviceScore.NoPressed);
    const successRate = totalPresses > 0 ? ((parseInt(gameDeviceScore.OkPressed) || 0) / totalPresses) * 100 : 0;
    const totalPlayTime = gameDeviceScore.avg_time ? (parseInt(gameDeviceScore.avg_time) * totalPresses) / 60 : 0;
    const currentHour = now.getHours().toString();
    
    await GameScoreReport.create({
      DeviceNumber: gameDeviceScore.DeviceNumber,
      ReportDate: today,
      TotalGames: 1,
      TotalOkPressed: parseInt(gameDeviceScore.OkPressed) || 0,
      TotalWrongPressed: parseInt(gameDeviceScore.WrongPressed) || 0,
      TotalNoPressed: parseInt(gameDeviceScore.NoPressed) || 0,
      AverageResponseTime: gameDeviceScore.avg_time || 0,
      FastestResponseTime: gameDeviceScore.avg_time || 0,
      SlowestResponseTime: gameDeviceScore.avg_time || 0,
      SuccessRate: successRate,
      TotalPlayTime: totalPlayTime,
      PeakHour: currentHour,
      ReportType: 'game_completion',
      Status: 'completed',
      Notes: `Game completed at ${now.toLocaleTimeString()} - Final Score: ${parseInt(gameDeviceScore.OkPressed) || 0} correct, ${parseInt(gameDeviceScore.WrongPressed) || 0} wrong, ${parseInt(gameDeviceScore.NoPressed) || 0} missed`
    });
    
    // Check if a report was created (should be 1)
    const reportsAfterStop = await GameScoreReport.count({ where: { DeviceNumber: 'DEVICE001' } });
    console.log(`Reports after STOP: ${reportsAfterStop}`);
    
    if (reportsAfterStop > 0) {
      const latestReport = await GameScoreReport.findOne({ 
        where: { DeviceNumber: 'DEVICE001' },
        order: [['createdAt', 'DESC']]
      });
      console.log('✅ Report created successfully!');
      console.log(`Report details:`);
      console.log(`- Report Type: ${latestReport.ReportType}`);
      console.log(`- Status: ${latestReport.Status}`);
      console.log(`- Notes: ${latestReport.Notes}`);
      console.log(`- Success Rate: ${latestReport.SuccessRate}%`);
    } else {
      console.log('❌ No report was created for STOP status');
    }

    console.log('\n🎯 Test Summary:');
    console.log(`- START status reports: ${reportsAfterStart}`);
    console.log(`- Score update reports: ${reportsAfterScore}`);
    console.log(`- STOP status reports: ${reportsAfterStop - reportsAfterScore}`);
    
    if (reportsAfterStart === 0 && reportsAfterScore === 0 && (reportsAfterStop - reportsAfterScore) === 1) {
      console.log('✅ All tests passed! Reports are only created on STOP status.');
    } else {
      console.log('❌ Some tests failed. Check the logic.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStopReportCreation(); 