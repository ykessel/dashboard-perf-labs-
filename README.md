# Air Quality Monitor Dashboard

A real-time environmental data monitoring and analysis dashboard built with Next.js, TypeScript, and Socket.io.

## Features

- **Real-time Data**: Live air quality metrics via WebSocket connection
- **Interactive Charts**: Dynamic timeline charts with Recharts
- **Data Tables**: Sortable and filterable historical data tables
- **Date Range Selection**: Custom date range picker for data filtering
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Real-time**: Socket.io client
- **Charts**: Recharts
- **Data Tables**: Custom hooks with sorting and pagination
- **Backend**: Node.js WebSocket server

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd challange-dashboard-ykessel
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

#### Option 1: Full Stack (Recommended)
Run both the Next.js app and WebSocket server concurrently:

```bash
npm run dev:full
```

This will start:
- Next.js development server on `http://localhost:3000`
- WebSocket server on `http://localhost:3001`

#### Option 2: Separate Processes
Run the servers in separate terminals:

Terminal 1 (Next.js app):
```bash
npm run dev
```

Terminal 2 (WebSocket server):
```bash
npm run websocket
```

#### Option 3: Production Build
```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_WEBSOCKET=true

# API Configuration
NEXT_PUBLIC_API_URL=https://api-challenge.dofleini.com
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-header.tsx
│   ├── summary-cards.tsx
│   ├── timeline-chart.tsx
│   └── historical-data-table.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and config
├── types/                # TypeScript type definitions
├── websocket-server.js   # WebSocket server
└── package.json
```

## Features

### Real-time Data
- WebSocket connection for live air quality updates
- Automatic reconnection on connection loss
- Real-time metric updates every 2 seconds

### Dashboard Components
- **Summary Cards**: Real-time metrics with trend indicators
- **Timeline Chart**: Interactive line charts for parameter trends
- **Data Table**: Historical data with sorting and filtering
- **Date Range Picker**: Custom date selection with calendar

### Data Parameters
- CO (Carbon Monoxide)
- NO2 (Nitrogen Dioxide)
- Temperature (°C)
- Relative Humidity (%)
- PT08.S1-S5 (Various air quality sensors)
- NMHC (Non-methane hydrocarbons)
- C6H6 (Benzene)
- NOx (Nitrogen oxides)
- AH (Absolute Humidity)

## Development

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run websocket` - Start WebSocket server
- `npm run dev:full` - Start both servers concurrently
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### WebSocket Server

The WebSocket server (`websocket-server.js`) provides:
- Real-time air quality data simulation
- Automatic data generation every 2 seconds
- CORS configuration for local development
- Connection management and cleanup

## API Integration

The dashboard integrates with external APIs:
- Air quality summary data
- Historical data ranges
- Timeline data for charts

All API calls are proxied through Next.js API routes for security and caching.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
