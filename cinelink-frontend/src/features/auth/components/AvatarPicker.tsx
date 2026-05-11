import { cn } from "@/lib/utils";
import { AVATARS } from "@/lib/avatars";

export default function AvatarPicker({
                                         value,
                                         onChange,
                                     }: {
    value: string;
    onChange: (avatar: string) => void;
}) {
    return (
        <div className="grid grid-cols-5 gap-3">
            {AVATARS.map((avatar) => {
                const active = value === avatar.key;

                return (
                    <button
                        key={avatar.key}
                        type="button"
                        onClick={() => onChange(avatar.key)}
                        className={cn(
                            "rounded-2xl border p-1 transition bg-white/5 hover:bg-white/10",
                            active ? "border-primary ring-2 ring-primary/40" : "border-white/10"
                        )}
                    >
                        <img
                            src={avatar.src}
                            alt={avatar.key}
                            className="h-14 w-14 rounded-xl object-cover"
                        />
                    </button>
                );
            })}
        </div>
    );
}
