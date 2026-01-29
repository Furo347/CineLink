import type {ComponentProps} from "react";

type InputProps = ComponentProps<"input">;

export default function Input({ className = "", ...props }: InputProps) {
    return (
        <input
            {...props}
            className={`
        w-full bg-surface text-textPrimary
        border border-gray-700
        px-4 py-2 rounded-xl
        focus:outline-none focus:border-primary
        ${className}
      `}
        />
    );
}
