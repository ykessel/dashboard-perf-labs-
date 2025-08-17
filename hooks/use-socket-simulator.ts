"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface SimulatedSocketData {
  [key: string]: number
}

interface UseSocketSimulatorOptions {
  enabled?: boolean
  updateInterval?: number // milliseconds
  dataVariation?: number // percentage of variation
  baseValues?: Record<string, number>
}

export function useSocketSimulator(options: UseSocketSimulatorOptions = {}) {
  const {
    enabled = false,
    updateInterval = 2000, // 2 seconds
    dataVariation = 5, // 5% variation
    baseValues = {
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
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState<SimulatedSocketData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Use refs to avoid dependency issues
  const enabledRef = useRef(enabled)
  const dataVariationRef = useRef(dataVariation)
  const baseValuesRef = useRef(baseValues)
  const updateIntervalRef = useRef(updateInterval)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update refs when props change
  useEffect(() => {
    enabledRef.current = enabled
    dataVariationRef.current = dataVariation
    baseValuesRef.current = baseValues
    updateIntervalRef.current = updateInterval
  }, [enabled, dataVariation, baseValues, updateInterval])

  // Generate new simulated data function
  const generateNewData = useCallback((): SimulatedSocketData => {
    const newData: SimulatedSocketData = {}
    
    Object.entries(baseValuesRef.current).forEach(([key, baseValue]) => {
      const variation = (Math.random() - 0.5) * 2 * (dataVariationRef.current / 100)
      newData[key] = baseValue * (1 + variation)
    })
    
    return newData
  }, [])

  // Simulate connection
  const connect = useCallback(() => {
    if (!enabledRef.current) return
    
    setIsConnected(true)
    setError(null)
    
    // Generate initial data
    setData(generateNewData())
    
    console.log('🔌 Socket Simulator: Connected')
  }, [generateNewData])

  // Simulate disconnection
  const disconnect = useCallback(() => {
    setIsConnected(false)
    setData(null)
    setError(null)
    
    // Clear interval if exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    console.log('🔌 Socket Simulator: Disconnected')
  }, [])

  // Simulate error
  const simulateError = useCallback((errorMessage: string) => {
    setError(errorMessage)
    setIsConnected(false)
    
    // Clear interval if exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    console.log('🔌 Socket Simulator: Error -', errorMessage)
  }, [])

  // Auto-reconnect on error
  const reconnect = useCallback(() => {
    if (!enabledRef.current) return
    
    setError(null)
    connect()
  }, [connect])

  // Update data periodically
  useEffect(() => {
    if (!enabledRef.current || !isConnected) {
      // Clear interval if not connected
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set new interval
    intervalRef.current = setInterval(() => {
      setData(generateNewData())
    }, updateIntervalRef.current)

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isConnected, generateNewData])

  // Auto-connect when enabled
  useEffect(() => {
    if (enabledRef.current) {
      connect()
    } else {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    data,
    error,
    connect,
    disconnect,
    reconnect,
    simulateError,
  }
}
