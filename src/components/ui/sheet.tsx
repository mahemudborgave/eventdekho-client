import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

const Sheet = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Root ref={ref} className={cn(className)} {...props} />
))
Sheet.displayName = "Sheet"

const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background p-6 shadow-lg transition-transform duration-300",
        className
      )}
      {...props}
    />
  </SheetPrimitive.Portal>
))
SheetContent.displayName = "SheetContent"

export { Sheet, SheetTrigger, SheetClose, SheetContent }
