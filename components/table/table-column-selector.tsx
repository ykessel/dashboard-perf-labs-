"use client"

import React from "react"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { TableColumnSelectorProps } from "@/types/table"

export function TableColumnSelector<T>({ columns, visibleColumns, onColumnVisibilityChange, className }: TableColumnSelectorProps<T>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Settings2 className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 bg-background/95 backdrop-blur-sm" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Toggle columns</h4>
          {columns.map((column) => (
            <div key={column.key} className="flex items-center space-x-3 p-2 rounded-md">
              <Checkbox
                id={column.key}
                checked={visibleColumns.has(column.key)}
                onCheckedChange={() => onColumnVisibilityChange(column.key)}
                className="scale-110"
              />
              <label htmlFor={column.key} className="text-sm font-normal cursor-pointer text-foreground">
                {column.label}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
