import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, onChange, ...props }, ref) => {
    return (
      <span className="inline-flex">
        <label
          className="relative inline-flex items-center cursor-pointer"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            className="sr-only peer"
            ref={ref}
            {...(props as any)}
          />
          <div
            className={cn(
              "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-colors shadow-sm",
              checked
                ? "bg-primary border-primary"
                : "bg-transparent border-primary",
              className,
            )}
          >
            <Check
              aria-hidden="true"
              className={cn(
                "h-3 w-3 text-primary-foreground transition-opacity",
                checked ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        </label>
      </span>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
