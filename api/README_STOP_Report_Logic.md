# Game Score Report - STOP Status Logic

## Overview
The MQTT handler has been updated to create new `GameScoreReport` entries **only** when the game status is "STOP". This ensures that reports are created at the completion of each game session with final scores and performance metrics.

## Changes Made

### 1. MQTT Handler Logic (`api/helpers/mqttHelper.js`)

#### Before:
- Reports were created for any game status that was not "START"
- Reports were created on every score update
- This resulted in multiple report entries per game session

#### After:
- Reports are created **only** when `gameStatus === "STOP"`
- No reports are created for score updates during gameplay
- Each completed game session gets exactly one report entry

### 2. Report Creation Logic

When a "STOP" status is received:

```javascript
if(gameStatus === "STOP") {
  await storeGameScoreReport(gameDeviceScore, gameStatus);
}
```

### 3. Report Data Structure

Each STOP report contains:

- **DeviceNumber**: The game device identifier
- **ReportDate**: Current date (YYYY-MM-DD)
- **TotalGames**: 1 (single game completion)
- **TotalOkPressed**: Final count of correct presses
- **TotalWrongPressed**: Final count of wrong presses  
- **TotalNoPressed**: Final count of missed presses
- **AverageResponseTime**: Average response time for the game
- **SuccessRate**: Calculated success percentage
- **TotalPlayTime**: Total play time in minutes
- **PeakHour**: Hour when game was completed
- **ReportType**: 'game_completion'
- **Status**: 'completed'
- **Notes**: Detailed completion summary with timestamp

## MQTT Payload Examples

### Game Start (No Report Created)
```
DEVICE001,Status,START
```

### Score Updates During Game (No Report Created)
```
DEVICE001,Status,5,10,3,2.5,1.8
```

### Game Stop (Report Created)
```
DEVICE001,Status,STOP
```

## Testing

Use the test script to verify the logic:

```bash
cd api
node test-stop-report.js
```

The test script will:
1. Simulate START status (should create 0 reports)
2. Simulate score updates (should create 0 reports)  
3. Simulate STOP status (should create 1 report)
4. Verify that only STOP status creates reports

## Benefits

1. **Clean Data**: One report per completed game session
2. **Final Scores**: Reports contain complete game performance data
3. **Performance**: Reduced database writes during gameplay
4. **Analytics**: Clear game completion metrics for analysis

## Database Impact

- **Reduced Writes**: No longer creating reports on every score update
- **Better Data Quality**: Each report represents a complete game session
- **Easier Queries**: Reports can be directly used for game completion analytics

## Frontend Integration

The existing `GameScoreReports.jsx` component will automatically display these new report entries. The reports will show:

- Game completion timestamps
- Final performance metrics
- Success rates and response times
- Peak hour analysis

## Migration Notes

- Existing reports in the database remain unchanged
- New reports will follow the STOP-only logic
- No database migration required
- Backward compatible with existing frontend 