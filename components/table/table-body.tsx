"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { TableBodyProps } from "@/types/table"

export function TableBody<T>({ data, columns, loading, className, rowClassName, cellClassName, getRowId }: TableBodyProps<T>) {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Loading...
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  if (data.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
            No data available
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody className={className}>
      {data.map((row, index) => {
        const rowId = getRowId ? getRowId(row, index) : `row-${index}`
        return (
          <tr
            key={rowId}
            className={cn(
              "border-b transition-colors",
              index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900",
              "hover:bg-primary/10",
              rowClassName
            )}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                className={cn(
                  "p-4 text-sm",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  cellClassName
                )}
              >
                {column.render ? (
                  column.render(row[column.key as keyof T], row, index)
                ) : column.formatter ? (
                  column.formatter(row[column.key as keyof T])
                ) : (
                  String(row[column.key as keyof T] || "")
                )}
              </td>
            ))}
          </tr>
        )
      })}
    </tbody>
  )
}
