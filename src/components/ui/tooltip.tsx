
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

// Create a completely safe TooltipProvider that avoids all React APIs when React is null
const TooltipProvider = (props: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) => {
  // Check if React is completely null or if hooks are not available
  if (!React || typeof React.useState !== 'function') {
    console.warn('React hooks not available, rendering children without TooltipProvider');
    return React.createElement('div', {}, props.children);
  }
  
  try {
    return React.createElement(TooltipPrimitive.Provider, props);
  } catch (error) {
    console.warn('TooltipProvider failed, rendering children directly:', error);
    return React.createElement('div', {}, props.children);
  }
};

TooltipProvider.displayName = "TooltipProvider";

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
