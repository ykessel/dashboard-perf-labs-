"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, type Socket } from "socket.io-client"

interface SocketData {
  [key: string]: number
}

export function useSocket(url?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState<SocketData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (!url || socketRef.current?.connected) return

    try {
      const socket = io(url, {
        transports: ["websocket", "polling"],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      })

      socketRef.current = socket

      socket.on("connect", () => {
        setIsConnected(true)
        setError(null)
        console.log("WebSocket connected")
      })

      socket.on("disconnect", () => {
        setIsConnected(false)
        console.log("WebSocket disconnected")
      })

      socket.on("air-quality-update", (newData: SocketData) => {
        setData(newData)
      })

      socket.on("connect_error", (err) => {
        setError(`Connection failed: ${err.message}`)
        setIsConnected(false)
        console.error("WebSocket connection error:", err)
      })

      socket.on("reconnect", (attemptNumber) => {
        setIsConnected(true)
        setError(null)
        console.log(`WebSocket reconnected after ${attemptNumber} attempts`)
      })

      socket.on("reconnect_error", (err) => {
        setError(`Reconnection failed: ${err.message}`)
        setIsConnected(false)
        console.error("WebSocket reconnection error:", err)
      })

      socket.on("reconnect_failed", () => {
        setError("Failed to reconnect after multiple attempts")
        setIsConnected(false)
        console.error("WebSocket reconnection failed")
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : "Socket connection failed")
      console.error("WebSocket setup error:", err)
    }
  }, [url])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
    setData(null)
    setError(null)
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    data,
    error,
    disconnect,
    reconnect: connect,
  }
}
