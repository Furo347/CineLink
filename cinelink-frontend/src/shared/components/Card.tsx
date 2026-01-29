import type {PropsWithChildren} from "react";

export default function Card({ children }: PropsWithChildren) {
    return (
        <div className="bg-surface rounded-xl p-6 shadow-md">
            {children}
        </div>
    );
}
