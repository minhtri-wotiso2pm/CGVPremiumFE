import { type FC, useState } from "react";

/** Sharp 5-pointed star (outer r=10, inner r=4 → ratio 0.4), points up. */
const STAR_PATH =
    "M12 2L14.35 8.76L21.51 8.91L15.8 13.24L17.88 20.09L12 16L6.12 20.09L8.2 13.24L2.49 8.91L9.65 8.76Z";

const LABELS = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

interface StarRatingInputProps {
    value: number;
    onChange: (value: number) => void;
    size?: number;
    /** Show the "Good / Excellent…" hint next to the stars. */
    showLabel?: boolean;
    disabled?: boolean;
}

/** Interactive 1–5 star picker with hover preview and keyboard support. */
const StarRatingInput: FC<StarRatingInputProps> = ({
    value,
    onChange,
    size = 34,
    showLabel = true,
    disabled = false,
}) => {
    const [hover, setHover] = useState(0);
    const active = hover || value;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
                style={{ display: "inline-flex", gap: 6 }}
                role="radiogroup"
                aria-label="Your rating"
                onMouseLeave={() => setHover(0)}
            >
                {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= active;
                    return (
                        <button
                            key={star}
                            type="button"
                            role="radio"
                            aria-checked={value === star}
                            aria-label={`${star} star${star > 1 ? "s" : ""} — ${LABELS[star - 1]}`}
                            disabled={disabled}
                            onMouseEnter={() => !disabled && setHover(star)}
                            onFocus={() => !disabled && setHover(star)}
                            onBlur={() => setHover(0)}
                            onClick={() => !disabled && onChange(star)}
                            style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: disabled ? "default" : "pointer",
                                lineHeight: 0,
                                transform: filled && hover === star ? "scale(1.12)" : "scale(1)",
                                transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1)",
                            }}
                        >
                            <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d={STAR_PATH}
                                    fill={filled ? "#f5b301" : "transparent"}
                                    stroke={filled ? "#f5b301" : "rgba(255,255,255,0.3)"}
                                    strokeWidth={1}
                                    strokeLinejoin="miter"
                                />
                            </svg>
                        </button>
                    );
                })}
            </div>
            {showLabel && (
                <span
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: active ? "#f5b301" : "var(--cgv-text-muted, #6b4a4a)",
                        minWidth: 76,
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    {active ? LABELS[active - 1] : "Tap to rate"}
                </span>
            )}
        </div>
    );
};

export default StarRatingInput;
