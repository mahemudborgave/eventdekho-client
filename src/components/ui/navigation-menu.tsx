import * as React from "react"
import { cn } from "@/lib/utils"

const NavigationMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
      className={cn(
      "flex items-center gap-4 p-2 bg-background rounded-md shadow-sm",
        className
      )}
      {...props}
    />
))
NavigationMenu.displayName = "NavigationMenu"

export { NavigationMenu }
