import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => (
        <input
            type={type}
            ref={ref}
            className={cn(
                "h-11 w-full rounded-xl bg-white/5 px-4 text-text-primary placeholder:text-text-secondary/70 border border-white/10",
                "focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/40",
                className
            )}
            {...props}
        />
    )
);
Input.displayName = "Input";
