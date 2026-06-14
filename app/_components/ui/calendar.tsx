"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/app/_components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: any) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-slate-950/80 p-4 sm:p-6 [--cell-radius:50%] [--cell-size:38px] xs:[--cell-size:44px] sm:[--cell-size:52px] shadow-2xl rounded-[24px] sm:rounded-[28px] border border-white/10 backdrop-blur-xl",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-6 md:flex-row",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col gap-6", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 sm:size-10 p-0 select-none aria-disabled:opacity-50 bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all rounded-full",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 sm:size-10 p-0 select-none aria-disabled:opacity-50 bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white/90 transition-all rounded-full",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-10 w-full items-center justify-center px-10 mb-2",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-8 sm:h-10 w-full items-center justify-center gap-1.5 text-sm sm:text-base font-semibold text-white/90",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-full",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          "font-bold select-none text-base sm:text-lg text-white/90",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex gap-2", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-full text-[0.8rem] uppercase tracking-wider font-bold text-white/30 select-none text-center",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full gap-2", defaultClassNames.week),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "text-[0.9rem] text-muted-foreground select-none",
          defaultClassNames.week_number,
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-full p-0 text-center select-none",
          defaultClassNames.day,
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-full bg-primary/20 after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-primary/20",
          defaultClassNames.range_start,
        ),
        range_middle: cn(
          "rounded-none bg-primary/10",
          defaultClassNames.range_middle,
        ),
        range_end: cn(
          "relative isolate z-0 rounded-r-full bg-primary/20 after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-primary/20",
          defaultClassNames.range_end,
        ),
        today: cn(
          "rounded-full border-2 border-primary ring-offset-2 ring-offset-slate-950 text-primary-foreground font-bold",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-white/30 aria-selected:text-white/40",
          defaultClassNames.outside,
        ),
        disabled: cn("text-white/5 opacity-30", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }: any) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }: any) => {
          if (orientation === "left") {
            return (
              <ChevronLeft className={cn("size-5", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRight className={cn("size-5", className)} {...props} />
            );
          }

          return <ChevronDown className={cn("size-5", className)} {...props} />;
        },
        DayButton: ({ ...props }: any) => <CalendarDayButton {...props} />,
        WeekNumber: ({ children, ...props }: any) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: any) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isToday = modifiers.today;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square h-[--cell-size] w-[--cell-size] flex-col gap-1 border-0 leading-none font-semibold cursor-pointer transition-all !rounded-full",
        "hover:bg-white/10 hover:text-white/90",
        isToday &&
          "border-2 border-primary bg-primary/10 text-primary hover:bg-primary/20",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:hover:bg-primary/90",
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
