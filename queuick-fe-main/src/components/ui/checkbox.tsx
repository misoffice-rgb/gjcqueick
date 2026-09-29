import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <div className="flex items-center space-x-2">
    <div className="relative flex items-center">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-primary checked:text-primary-foreground",
          className,
        )}
        {...props}
      />
      <Check
        className="absolute left-0 top-0 hidden h-4 w-4 text-primary-foreground pointer-events-none peer-checked:block"
        strokeWidth={3}
      />
    </div>
  </div>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
