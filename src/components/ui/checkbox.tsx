import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, checked, defaultChecked, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
      if (onChange) {
        onChange(event);
      }
    };

    return (
      <label className={cn("relative inline-flex h-4 w-4 shrink-0 rounded-sm border border-primary bg-background text-primary shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
        <input
          ref={ref}
          type="checkbox"
          className="peer absolute inset-0 h-full w-full opacity-0 cursor-pointer m-0"
          onChange={handleChange}
          checked={checked}
          defaultChecked={defaultChecked}
          {...props}
        />
        <Check className="pointer-events-none absolute left-0 top-0 h-4 w-4 text-transparent transition-colors peer-checked:text-current" />
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };


