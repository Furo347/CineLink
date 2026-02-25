export type JwtPayloadAny = Record<string, unknown>;

export function decodeToken(token: string): JwtPayloadAny | null {
    try {
        const payload = token.split(".")[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function getJwtUserId(decoded: JwtPayloadAny | null): string | null {
    if (!decoded) return null;
    const candidates = [
        decoded.id,
        decoded.userId,
        decoded._id,
        decoded.sub,
    ];

    for (const v of candidates) {
        if (typeof v === "string" && v.trim()) return v;
    }
    return null;
}

export function getJwtEmail(decoded: JwtPayloadAny | null): string | null {
    const v = decoded?.email;
    return typeof v === "string" && v.trim() ? v : null;
}

export function getJwtName(decoded: JwtPayloadAny | null): string | null {
    const v = decoded?.name;
    return typeof v === "string" && v.trim() ? v : null;
}
