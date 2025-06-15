
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

// Safe TooltipProvider that completely avoids Radix when React is not ready
const TooltipProvider = (props: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) => {
  // Check if React and its essential methods are available
  if (!React || !React.useState || !React.useEffect || !React.createContext || !React.createElement) {
    console.warn('React not initialized, skipping TooltipProvider');
    return props.children;
  }
  
  // Additional check for React's internal state
  try {
    // Try to access React's internal dispatcher to ensure hooks are available
    const reactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    if (!reactInternals || !reactInternals.ReactCurrentDispatcher) {
      console.warn('React internals not ready, skipping TooltipProvider');
      return React.createElement('div', { className: 'tooltip-fallback' }, props.children);
    }
    
    // Only render the actual TooltipProvider if React is fully ready
    return React.createElement(TooltipPrimitive.Provider, props);
  } catch (error) {
    console.warn('TooltipProvider initialization failed:', error);
    return React.createElement('div', { className: 'tooltip-fallback' }, props.children);
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
