export const AVATARS = [
    { key: "avatar1", src: "/avatars/avatar1.jpg" },
    { key: "avatar2", src: "/avatars/avatar2.jpg" },
    { key: "avatar3", src: "/avatars/avatar3.jpg" },
    { key: "avatar4", src: "/avatars/avatar4.jpg" },
    { key: "avatar5", src: "/avatars/avatar5.jpg" },
] as const;

export type AvatarKey = (typeof AVATARS)[number]["key"];
