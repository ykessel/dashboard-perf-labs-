export const config = {
  // WebSocket configuration
  websocket: {
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3001",
  },
  
  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://api-challenge.dofleini.com",
  },
  
  // Development settings
  development: {
    enableWebSocket: process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === "true",
  }
}
