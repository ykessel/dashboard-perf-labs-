"use client"

import React from "react"
import { Calendar, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import type { DateRange } from "@/types/air-quality"
import { cn } from "@/lib/utils"
import { useDateRangePicker } from "@/hooks/use-date-range-picker"

interface DateRangePickerProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

// Temporary type for partial date range selection
interface TempDateRange {
  from?: Date
  to?: Date
}

interface CalendarInstructionsProps {
  tempDateRange: TempDateRange
  isSelecting: boolean
}

function CalendarInstructions({ tempDateRange, isSelecting }: CalendarInstructionsProps) {
  if (!tempDateRange?.from && !tempDateRange?.to) return null

  return (
    <>
      {(tempDateRange?.from || tempDateRange?.to) && (
        <div className="mt-2 text-xs text-muted-foreground">
          {tempDateRange?.from && !tempDateRange?.to && (
            <p>Select end date to complete range</p>
          )}
          {!tempDateRange?.from && tempDateRange?.to && (
            <p>Select start date to complete range</p>
          )}
          {tempDateRange?.from && tempDateRange?.to && (
            <>
              <p>Range selected: {format(tempDateRange.from, "MMM dd")} - {format(tempDateRange.to, "MMM dd, yyyy")}</p>
              <p className="mt-1 text-muted-foreground/70">💡 Use "Start New Selection" button or click on any date to create a new range</p>
            </>
          )}
        </div>
      )}
      {isSelecting && tempDateRange?.from && !tempDateRange?.to && (
        <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <p>🔄 Selecting range... Click on another date to set the end date</p>
        </div>
      )}
    </>
  )
}

interface CalendarActionsProps {
  tempDateRange: TempDateRange
  onApply: () => void
  onCancel: () => void
  onReset: () => void
}

function CalendarActions({ tempDateRange, onApply, onCancel, onReset }: CalendarActionsProps) {
  return (
    <>
      <div className="flex gap-2 mt-3 pt-3 border-t">
        {tempDateRange?.from && tempDateRange?.to ? (
          <>
            <Button 
              size="sm" 
              onClick={onApply}
              className="flex-1"
            >
              Apply
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onReset}
              className="flex-1"
            >
              Clear
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </>
        )}
      </div>
      {tempDateRange?.from && tempDateRange?.to && (
        <div className="mt-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onReset}
            className="w-full text-xs"
          >
            Start New Selection
          </Button>
        </div>
      )}
    </>
  )
}

export const DateRangePicker = React.memo(function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const {
    isCalendarOpen,
    setIsCalendarOpen,
    tempDateRange,
    isSelecting,
    handleDateSelect,
    handleResetRange,
    handleApplyRange,
    handleCancel,
  } = useDateRangePicker({ dateRange, onDateRangeChange })

  // Custom modifier function to only highlight days that are actually in the range
  // and not outside days (days from other months that appear in the calendar)
  const isInRange = (date: Date) => {
    if (!tempDateRange?.from || !tempDateRange?.to) return false
    
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    
    // Check if the date is within the selected range
    const isInSelectedRange = date >= tempDateRange.from && date <= tempDateRange.to
    
    // Check if the date is within the current month (not an outside day)
    const isInCurrentMonth = date >= startOfMonth && date <= endOfMonth
    
    return isInSelectedRange && isInCurrentMonth
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        <span>Date Range</span>
      </div>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal transition-all duration-200 hover:bg-accent hover:shadow-md cursor-pointer",
              !dateRange && "text-muted-foreground",
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-lg bg-background/95 backdrop-blur-sm" align="end">
          <div className="p-3">
            <CalendarComponent
              autoFocus
              mode="range"
              defaultMonth={tempDateRange?.from}
              selected={{ from: tempDateRange?.from, to: tempDateRange?.to }}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              // disabled={{ before: new Date(2004, 0, 1), after: new Date(2005, 11, 31) }}
              modifiers={{
                inRange: isInRange
              }}
              modifiersStyles={{
                inRange: { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
              }}
              showOutsideDays={true}
            />
            <CalendarActions
              tempDateRange={tempDateRange}
              onApply={handleApplyRange}
              onCancel={handleCancel}
              onReset={handleResetRange}
            />
            <CalendarInstructions
              tempDateRange={tempDateRange}
              isSelecting={isSelecting}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
})
