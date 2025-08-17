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
import { useIsMobile } from "@/hooks/use-media-query"

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
              className="flex-1 order-1 sm:order-1"
            >
              Apply
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 order-2 sm:order-2"
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
              className="flex-1 order-1 sm:order-1"
            >
              Clear
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 order-2 sm:order-2"
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

export const DateRangePicker = React.memo(function DateRangePicker({ 
  dateRange, 
  onDateRangeChange 
}: DateRangePickerProps) {
  const isMobile = useIsMobile()
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
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-full sm:w-auto",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(dateRange.from, "MMM dd, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={cn(
            "w-auto p-0 shadow-lg bg-background/95 backdrop-blur-sm",
            isMobile ? "w-[calc(100vw-2rem)] max-w-[320px]" : "w-auto"
          )}
          align="end"
          side="bottom"
          sideOffset={4}
        >
          <div className="p-3">
            <CalendarComponent
              autoFocus
              mode="range"
              defaultMonth={tempDateRange?.from}
              selected={{ from: tempDateRange?.from, to: tempDateRange?.to }}
              onSelect={handleDateSelect}
              numberOfMonths={isMobile ? 1 : 2}
              // disabled={{ before: new Date(2004, 0, 1), after: new Date(2005, 11, 31) }}
              modifiers={{
                inRange: isInRange
              }}
              modifiersStyles={{
                inRange: { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
              }}
              showOutsideDays={true}
              // Mobile optimizations
              classNames={{
                months: cn(
                  "flex space-y-4",
                  isMobile ? "flex-col" : "flex-row sm:space-x-4 sm:space-y-0"
                ),
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: cn(
                  "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                  "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                ),
                day: cn(
                  "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                  "hover:bg-accent hover:text-accent-foreground"
                ),
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
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
