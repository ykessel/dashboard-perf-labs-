// Socket configuration for development
export const socketConfig = {
  // Default mode (true = simulator, false = real socket)
  defaultUseSimulator: false,
  
  // Simulator settings
  simulator: {
    updateInterval: 2000, // milliseconds
    dataVariation: 3, // percentage of variation
    baseValues: {
      CO: 2.5,
      PT08S1: 1360,
      NMHC: 150,
      C6H6: 9,
      PT08S2: 1046,
      NOx: 147,
      PT08S3: 1056,
      NO2: 113,
      PT08S4: 1692,
      PT08S5: 1268,
      T: 18.5,
      RH: 45.5,
      AH: 0.8,
    }
  },
  
  // Real socket settings
  real: {
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
    autoConnect: true,
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  }
}

// Helper function to get socket mode from localStorage
export const getSocketMode = (): boolean => {
  if (typeof window === 'undefined') return socketConfig.defaultUseSimulator
  
  const stored = localStorage.getItem('socket-mode')
  if (stored === null) return socketConfig.defaultUseSimulator
  
  return stored === 'simulator'
}

// Helper function to set socket mode in localStorage
export const setSocketMode = (useSimulator: boolean): void => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('socket-mode', useSimulator ? 'simulator' : 'real')
}
