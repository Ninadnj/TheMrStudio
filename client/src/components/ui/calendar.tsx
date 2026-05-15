import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * iOS-style calendar — tabular figures, sage-filled selected day,
 * soft circles, hairline separators. Designed to live inside an
 * .app-card surface.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 tabular-nums", className)}
      classNames={{
        months: "flex flex-col gap-4",
        month: "space-y-3",
        caption: "flex justify-center pt-0.5 pb-2 relative items-center",
        caption_label:
          "text-[15px] font-semibold tracking-[-0.01em] text-[var(--theme-text)]",
        nav: "flex items-center",
        nav_button:
          "h-8 w-8 rounded-full inline-flex items-center justify-center text-[var(--theme-muted1)] hover:text-[var(--theme-text)] hover:bg-[color:color-mix(in_srgb,var(--theme-soft)_28%,transparent)] transition-colors",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row:
          "flex border-b border-[color:color-mix(in_srgb,var(--theme-line)_60%,transparent)] pb-1.5 mb-1.5",
        head_cell:
          "w-9 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--theme-muted1)]/70",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-[13.5px] p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 inline-flex items-center justify-center rounded-full font-medium text-[var(--theme-text)]",
          "transition-colors duration-200",
          "hover:bg-[color:color-mix(in_srgb,var(--theme-soft)_30%,transparent)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--theme-accent)_45%,transparent)]"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "!bg-[var(--theme-accent)] !text-[var(--theme-on-accent)] hover:!bg-[var(--theme-accent-hover)] shadow-[0_6px_18px_-8px_color-mix(in_srgb,var(--theme-accent)_70%,transparent)]",
        day_today:
          "ring-1 ring-[color:color-mix(in_srgb,var(--theme-accent)_50%,transparent)] ring-offset-0",
        day_outside: "text-[var(--theme-muted1)]/35",
        day_disabled:
          "text-[var(--theme-muted1)]/25 line-through decoration-[var(--theme-muted1)]/20",
        day_range_middle:
          "aria-selected:bg-[color:color-mix(in_srgb,var(--theme-soft)_28%,transparent)] aria-selected:text-[var(--theme-text)]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
