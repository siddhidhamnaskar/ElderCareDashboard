const dotenv = require('dotenv');
const {Room, Sensor, SensorTxn, UnlinkedSensorClient, GameDeviceScore, GameDevice, GameScoreReport} = require("../models");

dotenv.config();

module.exports.parse = async (payload, mqttClient, topic) => {
  try {
    let cleanedStr = payload.toString().replace(/[*#]/g, '');
    await parseInternal(cleanedStr, mqttClient, topic);
  } catch (error) {
    console.error('Error in parse:', error);
  }
};

const parseInternal = async (payload, mqttClient, topic) => {
  try {
    const input = payload;
    const parts = input.split(',');
    // console.log('parts:', parts);
    if(parts.length === 17) {
      console.log('Processing payload:', payload);
      const uid = parts[0];

      // Check if SensorClients entry exists for uid, create if not
      let client = await UnlinkedSensorClient.findOne({ where: { uid } });
      if (!client) {
        client = await UnlinkedSensorClient.create({ uid, name: `Client ${uid}` });
        console.log(`Created new SensorClients entry for uid: ${uid}`);
      }

      // Get existing sensors for this client
      const sensors = await Sensor.findAll({ 
        where: { client_uid: uid },
        order: [['createdAt', 'ASC']]
      });

      // Create default sensors if none exist
      if (!sensors || sensors.length === 0) {
        const defaultSensors = [
          { serial: `${uid}_SENSOR001`, client_uid: uid },
          { serial: `${uid}_SENSOR002`, client_uid: uid },
          { serial: `${uid}_SENSOR003`, client_uid: uid },
          { serial: `${uid}_SENSOR004`, client_uid: uid },
          { serial: `${uid}_SENSOR005`, client_uid: uid },
          { serial: `${uid}_SENSOR006`, client_uid: uid },
          { serial: `${uid}_SENSOR007`, client_uid: uid },
          { serial: `${uid}_SENSOR008`, client_uid: uid },
          { serial: `${uid}_SENSOR009`, client_uid: uid },
          { serial: `${uid}_SENSOR010`, client_uid: uid },
          { serial: `${uid}_SENSOR011`, client_uid: uid },
          { serial: `${uid}_SENSOR012`, client_uid: uid },
          { serial: `${uid}_SENSOR013`, client_uid: uid },
          { serial: `${uid}_SENSOR014`, client_uid: uid },
          { serial: `${uid}_SENSOR015`, client_uid: uid },
        ];

        await Promise.all(defaultSensors.map(sensor => 
          Sensor.create(sensor)
        ));
        
        // Fetch the newly created sensors
        const newSensors = await Sensor.findAll({ 
          where: { client_uid: uid },
          order: [['createdAt', 'ASC']]
        });
        
        if (newSensors.length >= parts.length-2) {
          await updateSensorStatuses(newSensors, parts);
        } else {
          console.error(`Expected at least ${parts.length-2} sensors for client_uid ${uid}, but found ${newSensors.length}`);
        }
      } else if (sensors.length >= parts.length-2) {
        await updateSensorStatuses(sensors, parts);
      } else {
        console.error(`Expected at least ${parts.length-2} sensors for client_uid ${uid}, but found ${sensors.length}`);
      }
    }else if(parts.length==9 && parts[1]=="Status") {
       console.log('Processing payload:', payload);
       const deviceNumber = parts[0];
       
       // Check if GameDevice exists, create if not
       let gameDevice = await GameDevice.findOne({ where: { DeviceNumber: deviceNumber } });
       if (!gameDevice) {
         gameDevice = await GameDevice.create({ 
           DeviceNumber: deviceNumber,
           status: 'active',
           lastHeartBeatTime: new Date()
         });
         console.log(`Created new GameDevice for DeviceNumber: ${deviceNumber}`);
       }
       else{
         gameDevice.lastHeartBeatTime = new Date();
         await gameDevice.save();
       }
       
       // Now handle the GameDeviceScore
       const data = await GameDeviceScore.findOne({
        where:{
          DeviceNumber: deviceNumber
        }
       })
       if(!data){
         const newGameDeviceScore = await GameDeviceScore.create({
          DeviceNumber: deviceNumber,
          OkPressed: parts[4],
          WrongPressed: parts[5],
          NoPressed: parts[6],
          last_time: parts[7],
          avg_time: parts[8]
         });
         
         // No report creation for score updates - only create reports on STOP
      }else{
        await data.update({
          OkPressed: parts[4],
          WrongPressed: parts[5],
          NoPressed: parts[6],
          last_time: parts[7],
          avg_time: parts[8]
        });
        
        // No report creation for score updates - only create reports on STOP
      }
    }else if(parts.length==3 && parts[1]=="Status"){
      console.log('Processing payload:', payload);
      const deviceNumber = parts[0];
      const gameStatus = parts[2];
      const gameDevice = await GameDevice.findOne({ where: { DeviceNumber: deviceNumber } });
      gameDevice.lastHeartBeatTime = new Date();
      await gameDevice.save();
      const gameDeviceScore = await GameDeviceScore.findOne({ where: { DeviceNumber: deviceNumber } });
      if(gameDeviceScore){
        if(gameStatus=="START"){
          console.log('Game status is START');
          gameDeviceScore.OkPressed = 0;
          gameDeviceScore.WrongPressed = 0;
          gameDeviceScore.NoPressed = 0;
          gameDeviceScore.last_time = 0;
          gameDeviceScore.avg_time = 0;
          gameDeviceScore.game_status = gameStatus;
        } else {
          gameDeviceScore.game_status = gameStatus;
          
          // Create new report entry only when game status is STOP
          if(gameStatus === "STOP") {
            await storeGameScoreReport(gameDeviceScore, gameStatus);
          }
        }
        await gameDeviceScore.save();
      }
      else{
        const newGameDeviceScore = await GameDeviceScore.create({
          DeviceNumber: deviceNumber,
          game_status: gameStatus
          
        });
        
        // Create new report entry only when game status is STOP
        if(gameStatus === "STOP") {
          await storeGameScoreReport(newGameDeviceScore, gameStatus);
        }
      }
    }else { 
      const data = await GameDevice.findOne({ where: { DeviceNumber: parts[0] } });
      if(data){
        data.lastHeartBeatTime = new Date();
        await data.save();
      }
      // console.log('Invalid payload format:', payload);
    }
  } catch (err) {
    console.error('Error processing MQTT payload:', err);
    throw err; // Re-throw to be caught by the outer try-catch
  }
};

// Function to store game score data in GameScoreReport table
const storeGameScoreReport = async (gameDeviceScore, gameStatus) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const now = new Date();
    
    // Calculate success rate
    const totalPresses = parseInt(gameDeviceScore.OkPressed) + parseInt(gameDeviceScore.WrongPressed) + parseInt(gameDeviceScore.NoPressed);
    const successRate = totalPresses > 0 ? ((parseInt(gameDeviceScore.OkPressed) || 0) / totalPresses) * 100 : 0;
    
    // Calculate total play time in minutes (assuming avg_time is in seconds)
    const totalPlayTime = gameDeviceScore.avg_time ? (parseInt(gameDeviceScore.avg_time) * totalPresses) / 60 : 0;
    
    // Get current hour for peak hour analysis
    const currentHour = now.getHours().toString();
    
    // For STOP status, create a new report entry with game completion data
    if (gameStatus === "STOP") {
      // Create new game completion report
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
      
      console.log(`Created new GameScoreReport for completed game on device ${gameDeviceScore.DeviceNumber} at ${now.toLocaleTimeString()}`);
    }
    
  } catch (error) {
    console.error('Error storing game score report:', error);
  }
};

const updateSensorStatuses = async (sensors, parts) => {
  const now = new Date();
  const previousStatuses = sensors.slice(0, 4).map(sensor => sensor.status);
  const updates = [];
  const transactions = [];

  // Prepare updates
  for (let i = 0; i < parts.length-2; i++) {
    const newStatus = parts[i+2] == process.env.ACTIVE_CODE ? "ACTIVE" : 
                     parts[i+2] == "2" ? "BAD" : "INACTIVE";
    
    if (previousStatuses[i] !== newStatus) {
      updates.push({
        sensor: sensors[i],
        newStatus,
        now
      });

      transactions.push({
        sensor_serial: sensors[i].serial,
        type: newStatus === "ACTIVE" ? "OPEN" : 
              newStatus === "INACTIVE" ? "CLOSE" : "BAD",
        timestamp: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Execute updates
  await Promise.all(updates.map(update => 
    update.sensor.update({
      status: update.newStatus,
      since: update.now
    })
  ));

  // Create transactions
  if (transactions.length > 0) {
    await Promise.all(transactions.map(txn => 
      SensorTxn.create(txn)
    ));
  }
};
