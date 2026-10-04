"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, defaultChecked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          "relative inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-input transition-colors cursor-pointer select-none touch-manipulation",
          checked
            ? "bg-primary border-primary text-primary-foreground shadow-sm"
            : "bg-background hover:bg-muted/50 dark:bg-input/20",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only peer"
          {...props}
        />
        {checked && <Check className="size-3.5 stroke-[3]" />}
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
