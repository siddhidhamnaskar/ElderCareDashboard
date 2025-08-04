# GameScoreReport Table Documentation

## Overview

The `GameScoreReport` table is designed to store comprehensive game analytics and reporting data, similar to the `GameDeviceScore` table but with additional fields for detailed reporting and analysis.

## Table Structure

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER | Primary key, auto-increment |
| `DeviceNumber` | STRING | Device number reference (required) |
| `ReportDate` | DATEONLY | Date of the report (required) |
| `TotalGames` | INTEGER | Total number of games played |
| `TotalOkPressed` | INTEGER | Total number of times OK button was pressed |
| `TotalWrongPressed` | INTEGER | Total number of times Wrong button was pressed |
| `TotalNoPressed` | INTEGER | Total number of times No button was pressed |
| `AverageResponseTime` | FLOAT | Average response time in seconds |
| `FastestResponseTime` | FLOAT | Fastest response time in seconds |
| `SlowestResponseTime` | FLOAT | Slowest response time in seconds |
| `SuccessRate` | FLOAT | Success rate percentage (0-100) |
| `TotalPlayTime` | FLOAT | Total time spent playing in minutes |
| `PeakHour` | STRING | Hour with most activity (0-23) |
| `ReportType` | ENUM | Type of report ('daily', 'weekly', 'monthly') |
| `Status` | ENUM | Report status ('active', 'archived', 'pending') |
| `Notes` | TEXT | Additional notes or comments |
| `createdAt` | DATE | Record creation timestamp |
| `updatedAt` | DATE | Record update timestamp |

### Indexes

- `idx_game_score_reports_device_number` - Device number index
- `idx_game_score_reports_date` - Report date index
- `idx_game_score_reports_type` - Report type index
- `idx_game_score_reports_status` - Status index
- `idx_game_score_reports_device_date_type_unique` - Unique constraint on DeviceNumber, ReportDate, and ReportType

## API Endpoints

### Base URL: `/api/game-score-reports`

#### GET `/` - Get all reports
**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)
- `deviceNumber` (optional): Filter by device number
- `reportType` (optional): Filter by report type
- `status` (optional): Filter by status
- `startDate` (optional): Start date for date range filter
- `endDate` (optional): End date for date range filter

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

#### GET `/stats` - Get report statistics
**Query Parameters:**
- `deviceNumber` (optional): Filter by device number
- `reportType` (optional): Filter by report type
- `startDate` (optional): Start date for date range filter
- `endDate` (optional): End date for date range filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ReportType": "daily",
      "totalReports": 30,
      "totalGames": 1500,
      "avgSuccessRate": 85.5,
      "avgResponseTime": 2.3,
      "totalPlayTime": 1200.5
    }
  ]
}
```

#### GET `/:id` - Get report by ID
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "DeviceNumber": "DEV001",
    "ReportDate": "2024-12-21",
    "TotalGames": 50,
    "TotalOkPressed": 45,
    "TotalWrongPressed": 3,
    "TotalNoPressed": 2,
    "AverageResponseTime": 2.5,
    "SuccessRate": 90.0,
    "ReportType": "daily",
    "Status": "active",
    "gameDevice": {
      "DeviceNumber": "DEV001",
      "LTime": 10,
      "PTime": 20,
      "GTime": 30,
      "NL": 5
    }
  }
}
```

#### GET `/device/:deviceNumber` - Get reports by device number
**Query Parameters:**
- `reportType` (optional): Filter by report type
- `startDate` (optional): Start date for date range filter
- `endDate` (optional): End date for date range filter

#### POST `/` - Create new report
**Request Body:**
```json
{
  "DeviceNumber": "DEV001",
  "ReportDate": "2024-12-21",
  "TotalGames": 50,
  "TotalOkPressed": 45,
  "TotalWrongPressed": 3,
  "TotalNoPressed": 2,
  "AverageResponseTime": 2.5,
  "FastestResponseTime": 1.2,
  "SlowestResponseTime": 5.0,
  "SuccessRate": 90.0,
  "TotalPlayTime": 120.5,
  "PeakHour": "14",
  "ReportType": "daily",
  "Status": "active",
  "Notes": "Daily performance report"
}
```

#### POST `/generate` - Generate report from game device scores
**Request Body:**
```json
{
  "deviceNumber": "DEV001",
  "reportDate": "2024-12-21",
  "reportType": "daily"
}
```

#### PUT `/:id` - Update report
**Request Body:** Same as POST, but all fields are optional

#### DELETE `/:id` - Delete report

## Usage Examples

### Creating a Daily Report
```javascript
const response = await fetch('/api/game-score-reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    DeviceNumber: 'DEV001',
    ReportDate: '2024-12-21',
    TotalGames: 50,
    TotalOkPressed: 45,
    TotalWrongPressed: 3,
    TotalNoPressed: 2,
    AverageResponseTime: 2.5,
    SuccessRate: 90.0,
    ReportType: 'daily',
    Status: 'active'
  })
});
```

### Getting Reports for a Device
```javascript
const response = await fetch('/api/game-score-reports/device/DEV001?reportType=daily&startDate=2024-12-01&endDate=2024-12-31', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

### Getting Report Statistics
```javascript
const response = await fetch('/api/game-score-reports/stats?deviceNumber=DEV001&reportType=daily', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

## Relationships

- **GameDevice**: Many-to-One relationship with GameScoreReport
  - Foreign Key: `DeviceNumber`
  - Association: `gameDevice`

## Migration

To create the table, run:
```bash
npx sequelize-cli db:migrate
```

To rollback:
```bash
npx sequelize-cli db:migrate:undo
```

## Validation Rules

1. `DeviceNumber`, `ReportDate`, and `ReportType` are required fields
2. Unique constraint on combination of `DeviceNumber`, `ReportDate`, and `ReportType`
3. `ReportType` must be one of: 'daily', 'weekly', 'monthly'
4. `Status` must be one of: 'active', 'archived', 'pending'
5. `SuccessRate` should be between 0 and 100
6. Device must exist in GameDevices table before creating a report 