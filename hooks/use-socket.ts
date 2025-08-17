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
  const urlRef = useRef(url)

  // Update URL ref when it changes
  useEffect(() => {
    urlRef.current = url
  }, [url])

  const connect = useCallback(() => {
    if (!urlRef.current || socketRef.current?.connected) return

    try {
      const socket = io(urlRef.current, {
        transports: ["websocket", "polling"],
        timeout: 5000,
      })

      socketRef.current = socket

      socket.on("connect", () => {
        setIsConnected(true)
        setError(null)
        console.log('🔌 Real Socket: Connected')
      })

      socket.on("disconnect", () => {
        setIsConnected(false)
        console.log('🔌 Real Socket: Disconnected')
      })

      socket.on("air-quality-update", (newData: SocketData) => {
        setData(newData)
      })

      // Also listen for the actual event name used by the API
      socket.on("AIR_QUALITY_UPDATE", (newData: SocketData) => {
        setData(newData)
      })

      socket.on("connect_error", (err) => {
        setError(`Connection failed: ${err.message}`)
        setIsConnected(false)
        console.log('🔌 Real Socket: Connection Error -', err.message)
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Socket connection failed"
      setError(errorMessage)
      console.log('🔌 Real Socket: Error -', errorMessage)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      connect()
    }, 1000)
  }, [connect, disconnect])

  // Auto-connect when URL is provided
  useEffect(() => {
    if (url) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [url, connect, disconnect])

  return {
    isConnected,
    data,
    error,
    connect,
    disconnect,
    reconnect,
  }
}
