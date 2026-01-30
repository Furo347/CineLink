import { cn } from "@/lib/utils";

export function SectionTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
    return <h2 className={cn("text-lg font-semibold tracking-tight", className)}>{children}</h2>;
}

export function SectionHint({ className = "", children }: { className?: string; children: React.ReactNode }) {
    return <p className={cn("text-sm text-text-secondary", className)}>{children}</p>;
}
