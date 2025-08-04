# MQTT Integration with GameScoreReport

## Overview

The MQTT helper has been enhanced to automatically store game score data in the `GameScoreReport` table when game status changes occur. This provides real-time reporting and analytics for game devices.

## How It Works

### Trigger Conditions

The system stores data in `GameScoreReport` when:

1. **Game Status Changes** (3-part payload): When `gameStatus` is NOT "START"
2. **Score Updates** (9-part payload): When score data is received from devices

### MQTT Payload Formats

#### 3-Part Payload (Game Status)
```
DeviceNumber,Status,GameStatus
```
Example: `DEV001,Status,COMPLETED`

#### 9-Part Payload (Score Data)
```
DeviceNumber,Status,Value1,Value2,OkPressed,WrongPressed,NoPressed,last_time,avg_time
```
Example: `DEV001,Status,0,0,15,3,2,180,2.8`

## Automatic Report Generation

### Daily Reports

The system automatically creates or updates daily reports with the following logic:

1. **New Report Creation**: If no report exists for the current date, a new daily report is created
2. **Report Updates**: If a report already exists, the data is accumulated and updated

### Data Accumulation

When updating existing reports, the system:

- **Increments** `TotalGames` by 1
- **Adds** new button press counts to existing totals
- **Updates** response time statistics (average, fastest, slowest)
- **Recalculates** success rate based on accumulated data
- **Updates** peak hour based on current time
- **Accumulates** total play time

### Calculations

#### Success Rate
```javascript
SuccessRate = (TotalOkPressed / (TotalOkPressed + TotalWrongPressed + TotalNoPressed)) * 100
```

#### Total Play Time
```javascript
TotalPlayTime = (avg_time * totalPresses) / 60  // Convert seconds to minutes
```

#### Peak Hour
```javascript
PeakHour = currentHour.toString()  // 0-23
```

## Function: `storeGameScoreReport`

### Parameters
- `gameDeviceScore`: GameDeviceScore object with current game data
- `gameStatus`: String indicating the game status

### Logic Flow

1. **Get Current Date**: Extract today's date in YYYY-MM-DD format
2. **Calculate Metrics**: Compute success rate, play time, and other statistics
3. **Check Existing Report**: Look for existing daily report for the device
4. **Update or Create**: Either update existing report or create new one
5. **Log Activity**: Console logging for debugging and monitoring

### Error Handling

- All operations are wrapped in try-catch blocks
- Errors are logged but don't interrupt the main MQTT processing
- Graceful degradation ensures system stability

## Integration Points

### MQTT Message Processing

The integration is added to two main MQTT processing paths:

1. **Game Status Updates** (`parts.length == 3`):
   ```javascript
   if(gameStatus !== "START") {
     await storeGameScoreReport(gameDeviceScore, gameStatus);
   }
   ```

2. **Score Data Updates** (`parts.length == 9`):
   ```javascript
   await storeGameScoreReport(gameDeviceScore, 'SCORE_UPDATE');
   ```

### Database Operations

- **Read Operations**: Check for existing reports
- **Create Operations**: Generate new daily reports
- **Update Operations**: Accumulate data in existing reports
- **Relationship Handling**: Proper foreign key relationships with GameDevice

## Monitoring and Debugging

### Console Logs

The system provides detailed logging:

```
Created new GameScoreReport for device DEV001 on 2024-12-21
Updated GameScoreReport for device DEV001 on 2024-12-21
Error storing game score report: [error details]
```

### Test Script

Use the provided test script to verify functionality:

```bash
node test-game-score-report.js
```

## Performance Considerations

### Database Optimization

- **Indexes**: Proper indexing on DeviceNumber, ReportDate, and ReportType
- **Batch Operations**: Efficient database queries
- **Error Isolation**: Errors don't affect main MQTT processing

### Memory Management

- **Async Operations**: Non-blocking database operations
- **Error Boundaries**: Isolated error handling
- **Resource Cleanup**: Proper promise handling

## Configuration

### Environment Variables

No additional environment variables are required. The system uses existing database configuration.

### Database Requirements

- `GameScoreReport` table must exist (run migration first)
- Proper foreign key relationships with `GameDevice` table
- Sufficient database permissions for read/write operations

## Usage Examples

### Simulating Game Completion

```javascript
// MQTT payload for game completion
const payload = "DEV001,Status,COMPLETED";

// This will trigger:
// 1. Update GameDeviceScore.game_status
// 2. Create/update GameScoreReport for today
```

### Simulating Score Update

```javascript
// MQTT payload for score update
const payload = "DEV001,Status,0,0,20,5,3,240,3.2";

// This will trigger:
// 1. Update GameDeviceScore with new values
// 2. Create/update GameScoreReport for today
```

## Troubleshooting

### Common Issues

1. **No Reports Created**: Check if GameScoreReport table exists
2. **Data Not Accumulating**: Verify foreign key relationships
3. **Performance Issues**: Check database indexes
4. **Error Logs**: Monitor console for detailed error messages

### Debug Steps

1. Run the test script to verify basic functionality
2. Check database for existing reports
3. Monitor MQTT message processing logs
4. Verify database permissions and connections

## Future Enhancements

### Potential Improvements

1. **Weekly/Monthly Reports**: Automatic aggregation of daily reports
2. **Real-time Analytics**: WebSocket updates for live dashboard
3. **Export Functionality**: CSV/PDF report generation
4. **Advanced Metrics**: More sophisticated performance indicators
5. **Batch Processing**: Optimized for high-frequency updates 