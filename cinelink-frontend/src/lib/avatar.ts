export function getAvatarSrc(avatar?: string | null): string | null {
    if (!avatar) return null;

    const value = avatar.trim();
    if (!value) return null;

    if (/^https?:\/\//i.test(value)) return value;

    if (value.startsWith("/")) return value;
    if (value.startsWith("avatars/")) return `/${value}`;

    const allowed = new Set(["avatar1", "avatar2", "avatar3", "avatar4", "avatar5"]);
    if (allowed.has(value)) return `/avatars/${value}.jpg`;

    if (allowed.has(value.replace(/\.jpg$/i, ""))) return `/avatars/${value}`;

    return null;
}
