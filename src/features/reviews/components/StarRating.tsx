import { type FC, useId } from "react";

/** Sharp 5-pointed star (outer r=10, inner r=4 → ratio 0.4), points up. */
const STAR_PATH =
    "M12 2L14.35 8.76L21.51 8.91L15.8 13.24L17.88 20.09L12 16L6.12 20.09L8.2 13.24L2.49 8.91L9.65 8.76Z";

interface StarRatingProps {
    /** 0–5, may be fractional (e.g. 4.6) — partial fill is rendered. */
    value: number;
    /** Pixel size of each star. */
    size?: number;
    /** Gap between stars in px. */
    gap?: number;
    className?: string;
}

/** Read-only star display with fractional fill. Uses a per-star gradient so
 *  an average like 4.6 shows a partially-filled fifth star. */
const StarRating: FC<StarRatingProps> = ({ value, size = 16, gap = 2, className }) => {
    const uid = useId();
    const stars = [0, 1, 2, 3, 4];

    return (
        <span
            className={className}
            style={{ display: "inline-flex", alignItems: "center", gap }}
            role="img"
            aria-label={`${value.toFixed(1)} out of 5 stars`}
        >
            {stars.map((i) => {
                const fraction = Math.max(0, Math.min(1, value - i));
                const gradId = `star-${uid}-${i}`;
                return (
                    <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
                        <defs>
                            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                                <stop offset={`${fraction * 100}%`} stopColor="#f5b301" />
                                <stop offset={`${fraction * 100}%`} stopColor="transparent" />
                            </linearGradient>
                        </defs>
                        <path
                            d={STAR_PATH}
                            fill={`url(#${gradId})`}
                            stroke="#f5b301"
                            strokeWidth={1}
                            strokeLinejoin="miter"
                            opacity={fraction > 0 ? 1 : 0.4}
                        />
                    </svg>
                );
            })}
        </span>
    );
};

export default StarRating;
