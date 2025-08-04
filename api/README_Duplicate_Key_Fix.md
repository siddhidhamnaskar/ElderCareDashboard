# Duplicate Key Error Fix for Game Score Reports

## Problem
The system was encountering a duplicate key error when trying to create multiple game completion reports for the same device on the same day:

```
sqlMessage: "Duplicate entry 'NA-1507-552-2025-07-17-game_completion' for key 'GameScoreReports.idx_game_score_reports_device_date_type_unique'"
```

## Root Cause
The database had a unique constraint on the combination of:
- `DeviceNumber`
- `ReportDate` 
- `ReportType`

This prevented multiple `game_completion` reports from being created for the same device on the same date, which is not the desired behavior since each completed game should have its own report entry.

## Solution

### 1. Database Schema Changes

#### Migration Files Created:
- `20241221000008-add-game-completion-to-report-type.js` - Adds 'game_completion' to ReportType enum
- `20241221000009-add-completed-to-status-enum.js` - Adds 'completed' to Status enum  
- `20241221000010-remove-unique-constraint-game-completion.js` - Removes unique constraint

#### Model Updates (`api/models/gameScoreReport.js`):
```javascript
// Updated ReportType enum
ReportType: {
  type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'game_completion'),
  // ...
}

// Updated Status enum
Status: {
  type: DataTypes.ENUM('active', 'archived', 'pending', 'completed'),
  // ...
}

// Removed unique constraint from indexes
{
  fields: ['DeviceNumber', 'ReportDate', 'ReportType'],
  name: 'game_score_report_device_date_type'  // No longer unique
}
```

### 2. MQTT Handler Logic

The MQTT handler (`api/helpers/mqttHelper.js`) now:
- Creates reports only when `gameStatus === "STOP"`
- Allows multiple game completion reports per device per day
- Each report contains complete game performance data

## Benefits

1. **Multiple Games Per Day**: Players can complete multiple games on the same device on the same day
2. **Individual Game Tracking**: Each completed game gets its own detailed report
3. **Better Analytics**: More granular data for performance analysis
4. **No Data Loss**: All game completions are recorded

## Testing

### Run Migrations:
```bash
cd api
npx sequelize-cli db:migrate
```

### Test the Fix:
```bash
node test-duplicate-fix.js
```

This test verifies that:
- Multiple game completion reports can be created for the same device on the same day
- Each report contains accurate game data
- No duplicate key errors occur

## Expected Behavior

### Before Fix:
- ❌ Only one game completion report per device per day
- ❌ Duplicate key errors for multiple games
- ❌ Data loss for subsequent games

### After Fix:
- ✅ Multiple game completion reports per device per day
- ✅ Each completed game gets its own report
- ✅ No duplicate key errors
- ✅ Complete game history preserved

## Database Impact

- **Removed**: Unique constraint on (DeviceNumber, ReportDate, ReportType)
- **Added**: Non-unique index for query performance
- **Result**: Allows multiple game_completion reports per day while maintaining data integrity

## Frontend Impact

The existing `GameScoreReports.jsx` component will automatically display all game completion reports, showing:
- Multiple games per day for each device
- Individual game performance metrics
- Chronological game history
- Enhanced filtering and sorting capabilities 