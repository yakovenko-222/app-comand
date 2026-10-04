"use client"

import React, { createContext, useContext, useId } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

type TabsContextType = {
  value: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

const TabsContext = createContext<TabsContextType | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

function Tabs({
  className,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  orientation = "horizontal",
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = React.useCallback(
    (val: string) => {
      if (!isControlled) {
        setUncontrolledValue(val)
      }
      onValueChange?.(val)
    },
    [isControlled, onValueChange]
  )

  return (
    <TabsContext.Provider
      value={{
        value: value || "",
        onValueChange: handleValueChange,
        orientation,
      }}
    >
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn(
          "group/tabs flex gap-2",
          orientation === "horizontal" ? "flex-col" : "flex-row",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-1 text-muted-foreground select-none touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {}

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: TabsListProps) {
  return (
    <div
      role="tablist"
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

function TabsTrigger({
  className,
  value,
  onClick,
  children,
  type = "button",
  ...props
}: TabsTriggerProps) {
  const ctx = useContext(TabsContext)
  const isSelected = ctx?.value === value

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    ctx?.onValueChange?.(value)
    onClick?.(e)
  }

  return (
    <button
      type={type}
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? "active" : "inactive"}
      data-slot="tabs-trigger"
      onClick={handleClick}
      className={cn(
        "relative inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer select-none touch-manipulation",
        "text-muted-foreground hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isSelected && "bg-background text-foreground shadow-sm font-semibold dark:bg-card dark:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function TabsContent({
  className,
  value,
  children,
  ...props
}: TabsContentProps) {
  const ctx = useContext(TabsContext)
  const isSelected = ctx?.value === value

  if (!isSelected) return null

  return (
    <div
      role="tabpanel"
      data-state={isSelected ? "active" : "inactive"}
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
