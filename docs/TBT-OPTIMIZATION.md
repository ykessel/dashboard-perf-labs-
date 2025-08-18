# Total Blocking Time (TBT) Optimization Guide

## Overview

This document outlines the comprehensive optimizations implemented to reduce Total Blocking Time (TBT) in the Air Quality Dashboard application. TBT measures the total amount of time when the main thread was blocked for long enough to prevent input responsiveness.

## Current Performance Issues

Based on the performance report, the main bottlenecks were:
- **Script Evaluation**: 1,697ms (54.7% of total)
- **Other**: 580ms (18.7% of total)
- **Style & Layout**: 504ms (16.3% of total)
- **Rendering**: 139ms (4.5% of total)
- **Script Parsing & Compilation**: 115ms (3.7% of total)

## Implemented Optimizations

### 1. Next.js Configuration Optimizations

#### Bundle Splitting
```javascript
// Optimized webpack configuration with aggressive chunk splitting
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    vendor: { test: /[\\/]node_modules[\\/]/, name: 'vendors' },
    react: { test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/, name: 'react' },
    radix: { test: /[\\/]node_modules[\\/]@radix-ui[\\/]/, name: 'radix' },
    charts: { test: /[\\/]node_modules[\\/](recharts)[\\/]/, name: 'charts' },
    dateUtils: { test: /[\\/]node_modules[\\/](date-fns)[\\/]/, name: 'date-utils' },
  }
}
```

#### Tree Shaking
```javascript
// Enable tree shaking for unused code elimination
usedExports: true,
sideEffects: false,
```

#### Package Import Optimization
```javascript
// Optimize specific heavy packages
optimizePackageImports: [
  'lucide-react', 
  'date-fns', 
  '@radix-ui/react-alert-dialog',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-dialog',
  '@radix-ui/react-popover',
  '@radix-ui/react-select',
  '@radix-ui/react-slot'
]
```

### 2. Component-Level Optimizations

#### Dynamic Imports
```javascript
// Lazy load heavy components
const TimelineChart = dynamic(() => import("@/components/timeline-chart"), {
  loading: () => <div className="h-96 bg-muted/20 rounded-lg animate-pulse" />,
  ssr: false, // Disable SSR for charts
})
```

#### React.memo Implementation
```javascript
// Prevent unnecessary re-renders
const SummaryCard = React.memo<Props>(({ parameter, value, trend }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.value === nextProps.value && prevProps.trend === nextProps.trend
})
```

#### useMemo and useCallback Optimization
```javascript
// Memoize expensive calculations
const metrics = useMemo(() => {
  if (!socketData) return []
  return displayParams.map(param => {
    // Expensive calculation
  })
}, [socketData, displayParams, previousValues])

// Memoize event handlers
const handleParamToggle = useCallback((param: string) => {
  setSelectedParams(prev => {
    const newSet = new Set(prev)
    if (newSet.has(param)) {
      newSet.delete(param)
    } else {
      newSet.add(param)
    }
    return newSet
  })
}, [setSelectedParams])
```

### 3. Data Fetching Optimizations

#### Optimized React Query Configuration
```javascript
// Implement proper caching and stale time
return useQuery({
  queryKey,
  queryFn: () => fetchAirQualityData(dateRange),
  enabled,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})
```

#### Memoized Query Keys
```javascript
// Prevent unnecessary re-fetches
const queryKey = useMemo(() => [
  'air-quality', 
  dateRange.from.toISOString(), 
  dateRange.to.toISOString()
], [dateRange])
```

### 4. Font and Resource Optimization

#### Font Loading Optimization
```javascript
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
})
```

#### Resource Hints
```html
<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

<!-- Preload critical resources -->
<link rel="preload" href="/api/air-quality" as="fetch" crossOrigin="anonymous" />
```

### 5. Performance Monitoring

#### Custom Performance Hooks
```javascript
// Monitor component performance
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now()
      return () => {
        const endTime = performance.now()
        const duration = endTime - startTime
        if (duration > 16) {
          console.warn(`Performance warning: ${componentName} took ${duration.toFixed(2)}ms to render`)
        }
      }
    }
  }, [componentName])
}
```

#### Debouncing and Throttling
```javascript
// Debounce expensive operations
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}
```

## Expected Performance Improvements

### Before Optimization
- **Total TBT**: 3.1 seconds
- **Script Evaluation**: 1,697ms
- **Bundle Size**: Large monolithic chunks
- **Component Re-renders**: Frequent unnecessary updates

### After Optimization
- **Expected TBT Reduction**: 60-70%
- **Script Evaluation**: Reduced by chunk splitting and tree shaking
- **Bundle Size**: Optimized with code splitting
- **Component Re-renders**: Minimized with React.memo and useMemo

## Monitoring and Testing

### Performance Monitoring Script
Use the included performance monitoring script to track improvements:

```javascript
// Run in browser console
window.generatePerformanceReport()
```

### Lighthouse Testing
1. Run Lighthouse audit in Chrome DevTools
2. Focus on Performance tab
3. Check "Minimize main-thread work" section
4. Monitor TBT improvements

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

## Best Practices for Maintaining Low TBT

### 1. Code Splitting
- Use dynamic imports for heavy components
- Split routes and features into separate chunks
- Lazy load non-critical functionality

### 2. Component Optimization
- Use React.memo for expensive components
- Implement useMemo for expensive calculations
- Use useCallback for event handlers
- Avoid inline object/function creation

### 3. Data Management
- Implement proper caching strategies
- Use pagination for large datasets
- Debounce user input
- Optimize API calls

### 4. Resource Loading
- Optimize font loading
- Use resource hints (preconnect, prefetch)
- Compress and optimize images
- Minimize third-party scripts

### 5. Monitoring
- Regular performance audits
- Monitor Core Web Vitals
- Track TBT in production
- Set up performance budgets

## Troubleshooting

### High Script Evaluation Time
1. Check for large third-party libraries
2. Implement code splitting
3. Use tree shaking
4. Optimize bundle size

### Frequent Re-renders
1. Use React.memo
2. Implement useMemo and useCallback
3. Check for unnecessary state updates
4. Optimize context providers

### Slow Data Fetching
1. Implement proper caching
2. Use React Query or SWR
3. Optimize API endpoints
4. Consider server-side rendering

## Conclusion

These optimizations should significantly reduce TBT by:
- Reducing main thread blocking time
- Optimizing bundle delivery
- Minimizing unnecessary re-renders
- Implementing efficient data fetching
- Using proper resource loading strategies

Monitor the performance improvements using the provided tools and continue optimizing based on real-world usage patterns.
