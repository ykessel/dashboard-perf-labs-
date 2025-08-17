"use client"

import React from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TableHeaderProps } from "@/types/table"

export function TableHeader<T>({ columns, sort, onSort, className }: TableHeaderProps<T>) {
  const getSortIcon = (columnKey: string) => {
    if (!sort || sort.column !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
    }
    if (sort.direction === "asc") {
      return <ChevronUp className="h-4 w-4 text-primary" />
    }
    if (sort.direction === "desc") {
      return <ChevronDown className="h-4 w-4 text-primary" />
    }
    return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <thead className={cn("sticky top-0 bg-white dark:bg-gray-900 border-b z-10 shadow-sm", className)}>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              "text-left p-4 font-medium text-sm bg-white dark:bg-gray-900",
              column.width && `w-${column.width}`,
              column.align === "center" && "text-center",
              column.align === "right" && "text-right"
            )}
          >
            {column.sortable !== false && onSort ? (
              <div
                className="flex items-center cursor-pointer font-medium text-foreground"
                onClick={() => onSort(column.key)}
              >
                {column.label}
                <span className="ml-2">{getSortIcon(column.key)}</span>
              </div>
            ) : (
              <span className="font-medium text-foreground">{column.label}</span>
            )}
          </th>
        ))}
      </tr>
    </thead>
  )
}
