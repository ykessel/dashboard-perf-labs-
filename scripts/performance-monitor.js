// Performance monitoring script for TBT optimization
// Run this in the browser console to monitor performance

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      tbt: 0,
      scriptEvaluation: 0,
      styleLayout: 0,
      rendering: 0,
      parsing: 0,
      other: 0,
    }
    
    this.observers = []
    this.init()
  }

  init() {
    // Monitor Core Web Vitals
    this.observeCoreWebVitals()
    
    // Monitor Long Tasks (TBT)
    this.observeLongTasks()
    
    // Monitor Performance Timeline
    this.observePerformanceTimeline()
    
    // Monitor Resource Loading
    this.observeResourceLoading()
    
    console.log('🚀 Performance Monitor initialized')
  }

  observeCoreWebVitals() {
    // First Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcp = entries[entries.length - 1]
      this.metrics.fcp = fcp.startTime
      console.log(`🎨 FCP: ${fcp.startTime.toFixed(2)}ms`)
    }).observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcp = entries[entries.length - 1]
      this.metrics.lcp = lcp.startTime
      console.log(`📏 LCP: ${lcp.startTime.toFixed(2)}ms`)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        this.metrics.fid = entry.processingStart - entry.startTime
        console.log(`⚡ FID: ${this.metrics.fid.toFixed(2)}ms`)
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let cls = 0
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          cls += entry.value
        }
      })
      this.metrics.cls = cls
      console.log(`📐 CLS: ${cls.toFixed(4)}`)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  observeLongTasks() {
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.metrics.tbt += entry.duration
        console.warn(`🐌 Long Task: ${entry.duration.toFixed(2)}ms (TBT: ${this.metrics.tbt.toFixed(2)}ms)`)
        
        // Log the culprit if available
        if (entry.attribution && entry.attribution.length > 0) {
          const attribution = entry.attribution[0]
          console.warn(`   Culprit: ${attribution.name || 'Unknown'}`)
        }
      })
    }).observe({ entryTypes: ['longtask'] })
  }

  observePerformanceTimeline() {
    // Monitor main thread work breakdown
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          switch (entry.name) {
            case 'script-evaluation':
              this.metrics.scriptEvaluation += entry.duration
              break
            case 'style-layout':
              this.metrics.styleLayout += entry.duration
              break
            case 'rendering':
              this.metrics.rendering += entry.duration
              break
            case 'parsing':
              this.metrics.parsing += entry.duration
              break
            case 'other':
              this.metrics.other += entry.duration
              break
          }
        }
      })
    })
    
    observer.observe({ entryTypes: ['measure'] })
    this.observers.push(observer)
  }

  observeResourceLoading() {
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.initiatorType === 'script' && entry.duration > 100) {
          console.warn(`📦 Slow Script: ${entry.name} took ${entry.duration.toFixed(2)}ms`)
        }
      })
    }).observe({ entryTypes: ['resource'] })
  }

  getMetrics() {
    return {
      ...this.metrics,
      totalMainThreadWork: this.metrics.scriptEvaluation + this.metrics.styleLayout + 
                          this.metrics.rendering + this.metrics.parsing + this.metrics.other
    }
  }

  generateReport() {
    const metrics = this.getMetrics()
    const report = `
📊 Performance Report
====================
Core Web Vitals:
  FCP: ${metrics.fcp.toFixed(2)}ms
  LCP: ${metrics.lcp.toFixed(2)}ms
  FID: ${metrics.fid.toFixed(2)}ms
  CLS: ${metrics.cls.toFixed(4)}

Main Thread Work:
  Script Evaluation: ${metrics.scriptEvaluation.toFixed(2)}ms
  Style & Layout: ${metrics.styleLayout.toFixed(2)}ms
  Rendering: ${metrics.rendering.toFixed(2)}ms
  Parsing: ${metrics.parsing.toFixed(2)}ms
  Other: ${metrics.other.toFixed(2)}ms
  Total: ${metrics.totalMainThreadWork.toFixed(2)}ms

Total Blocking Time: ${metrics.tbt.toFixed(2)}ms
    `
    
    console.log(report)
    return report
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    console.log('🔚 Performance Monitor destroyed')
  }
}

// Auto-start monitoring
const monitor = new PerformanceMonitor()

// Expose to global scope for manual access
window.performanceMonitor = monitor

// Generate report after page load
window.addEventListener('load', () => {
  setTimeout(() => {
    monitor.generateReport()
  }, 1000)
})

// Generate report on demand
window.generatePerformanceReport = () => monitor.generateReport()
