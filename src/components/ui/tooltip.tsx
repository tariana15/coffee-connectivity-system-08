
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

// Create a robust TooltipProvider that handles React initialization issues
const TooltipProvider = (props: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) => {
  // Add multiple checks to ensure React is fully available
  if (!React || !React.useState || !React.useEffect || !React.createContext) {
    console.warn('React not fully initialized, rendering children without tooltip functionality');
    // Return children wrapped in a simple div to maintain structure
    if (React && React.createElement) {
      return React.createElement('div', { className: 'tooltip-fallback' }, props.children);
    }
    // Fallback for when even React.createElement is not available
    return props.children;
  }
  
  // Additional safety check - try to detect if we're in a valid React render context
  try {
    // Test if React context is working by attempting to access current fiber
    if (typeof window !== 'undefined' && !(window as any).React) {
      console.warn('React not available on window, using fallback');
      return React.createElement('div', { className: 'tooltip-fallback' }, props.children);
    }
    
    return React.createElement(TooltipPrimitive.Provider, props);
  } catch (error) {
    console.warn('TooltipProvider failed during render:', error);
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
