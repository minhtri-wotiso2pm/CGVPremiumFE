import { type FC } from "react";

interface Props {
    name?: string | null;
    photoUrl?: string | null;
    size?: number;
}

function initials(name?: string | null): string {
    const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Circular avatar with an initials fallback — shared by the table and selects. */
const PersonAvatar: FC<Props> = ({ name, photoUrl, size = 34 }) => {
    const safeName = name ?? "";
    if (photoUrl) {
        return (
            <img
                src={photoUrl}
                alt={safeName}
                style={{
                    width: size, height: size, borderRadius: "50%", objectFit: "cover",
                    flexShrink: 0, border: "1px solid var(--dash-border)",
                }}
            />
        );
    }
    return (
        <span
            aria-hidden="true"
            style={{
                width: size, height: size, borderRadius: "50%", flexShrink: 0,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "rgba(232,0,28,0.08)", color: "#E8001C",
                fontSize: size * 0.4, fontWeight: 700, letterSpacing: "0.02em",
                border: "1px solid rgba(232,0,28,0.18)",
            }}
        >
            {initials(safeName)}
        </span>
    );
};

export default PersonAvatar;
