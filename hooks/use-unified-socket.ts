"use client"

import { useSocket } from './use-socket'
import { useSocketSimulator } from './use-socket-simulator'
import { config } from '@/lib/config'

interface SocketData {
  [key: string]: number
}

interface UnifiedSocketReturn {
  isConnected: boolean
  data: SocketData | null
  error: string | null
  connect: () => void
  disconnect: () => void
  reconnect: () => void
  simulateError?: (message: string) => void
  isSimulated: boolean
}

interface UseUnifiedSocketOptions {
  useSimulator?: boolean
  simulatorOptions?: {
    enabled?: boolean
    updateInterval?: number
    dataVariation?: number
    baseValues?: Record<string, number>
  }
}

export function useUnifiedSocket(options: UseUnifiedSocketOptions = {}): UnifiedSocketReturn {
  const {
    useSimulator = false,
    simulatorOptions = {}
  } = options

  // Real Socket.IO connection
  const realSocket = useSocket(
    !useSimulator && config.development.enableWebSocket ? config.websocket.url : undefined
  )

  // Simulated Socket connection
  const simulatedSocket = useSocketSimulator({
    enabled: useSimulator,
    ...simulatorOptions
  })

  // Return the appropriate socket based on configuration
  if (useSimulator) {
    return {
      isConnected: simulatedSocket.isConnected,
      data: simulatedSocket.data,
      error: simulatedSocket.error,
      connect: simulatedSocket.connect,
      disconnect: simulatedSocket.disconnect,
      reconnect: simulatedSocket.reconnect,
      simulateError: simulatedSocket.simulateError,
      isSimulated: true,
    }
  }

  return {
    isConnected: realSocket.isConnected,
    data: realSocket.data,
    error: realSocket.error,
    connect: realSocket.connect,
    disconnect: realSocket.disconnect,
    reconnect: realSocket.reconnect,
    simulateError: () => console.warn('Simulate error not available for real socket'),
    isSimulated: false,
  }
}
