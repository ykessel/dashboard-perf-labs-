export const config = {
  // WebSocket configuration
  websocket: {
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "https://api-challenge.dofleini.com",
  },
  
  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://api-challenge.dofleini.com",
  },
  
  // Development settings
  development: {
    enableWebSocket: true, // Enable WebSocket by default since API supports it
  }
}
