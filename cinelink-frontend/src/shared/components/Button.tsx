import type {ComponentProps} from "react";

type ButtonProps = ComponentProps<"button">;

export default function Button({ className = "", ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className={`
        bg-primary text-white font-medium
        px-4 py-2 rounded-xl
        hover:opacity-90 transition
        disabled:opacity-50
        ${className}
      `}
        />
    );
}
