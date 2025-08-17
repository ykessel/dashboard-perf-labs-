"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface LayoutStableProps {
  children: React.ReactNode
  height?: string | number
  minHeight?: string | number
  className?: string
  preventShift?: boolean
}

/**
 * A wrapper component that prevents layout shifts by maintaining consistent dimensions
 */
export function LayoutStable({ 
  children, 
  height, 
  minHeight, 
  className,
  preventShift = true 
}: LayoutStableProps) {
  const style = {
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    ...(minHeight && { minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }),
  }

  return (
    <div 
      className={cn(
        preventShift && "prevent-layout-shift",
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

/**
 * A skeleton loading component that maintains layout stability
 */
export function Skeleton({ className, width, height }: SkeletonProps) {
  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  }

  return (
    <div 
      className={cn("skeleton rounded-md", className)}
      style={style}
    />
  )
}

interface StableGridProps {
  children: React.ReactNode
  columns?: number
  minWidth?: string | number
  gap?: string | number
  className?: string
}

/**
 * A grid component that maintains stable layout during content changes
 */
export function StableGrid({ 
  children, 
  columns, 
  minWidth = 250, 
  gap = 16,
  className 
}: StableGridProps) {
  const style = {
    '--grid-cols': columns || 'auto-fit',
    '--grid-min-width': typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
    '--grid-gap': typeof gap === 'number' ? `${gap}px` : gap,
  } as React.CSSProperties

  return (
    <div 
      className={cn("stable-grid", className)}
      style={style}
    >
      {children}
    </div>
  )
}