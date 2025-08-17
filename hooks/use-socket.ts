"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface SocketData {
  [key: string]: number
}

export function useSocket(url?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState<SocketData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Only connect if URL is provided (for real Socket.io server)
    if (!url) return

    try {
      const socket = io(url, {
        transports: ["websocket", "polling"],
        timeout: 5000,
      })

      socketRef.current = socket

      socket.on("connect", () => {
        setIsConnected(true)
        setError(null)
      })

      socket.on("disconnect", () => {
        setIsConnected(false)
      })

      socket.on("air-quality-update", (newData: SocketData) => {
        setData(newData)
      })

      socket.on("connect_error", (err) => {
        setError(`Connection failed: ${err.message}`)
        setIsConnected(false)
      })

      return () => {
        socket.disconnect()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Socket connection failed")
    }
  }, [url])

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
  }

  return {
    isConnected,
    data,
    error,
    disconnect,
  }
}
