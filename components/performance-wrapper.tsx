import React from 'react'

interface PerformanceWrapperProps {
  children: React.ReactNode
  name?: string
}

// Performance wrapper component that prevents unnecessary re-renders
export const PerformanceWrapper = React.memo<PerformanceWrapperProps>(
  ({ children, name = 'Component' }) => {
    return <>{children}</>
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render if children actually changed
    return prevProps.children === nextProps.children
  }
)

PerformanceWrapper.displayName = 'PerformanceWrapper'

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now()
      
      return () => {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        if (duration > 16) { // Longer than one frame (16.67ms)
          console.warn(`Performance warning: ${componentName} took ${duration.toFixed(2)}ms to render`)
        }
      }
    }
  }, [componentName])
}

// Hook for debouncing expensive operations
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttling expensive operations
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value)
  const lastRun = React.useRef<number>(Date.now())

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= delay) {
        setThrottledValue(value)
        lastRun.current = Date.now()
      }
    }, delay - (Date.now() - lastRun.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return throttledValue
}
