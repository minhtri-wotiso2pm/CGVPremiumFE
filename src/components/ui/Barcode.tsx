import { type FC, useMemo } from "react";
import { buildCode39 } from "@/utils/code39";
import { buildCode128 } from "@/utils/code128";

/**
 * Renders a real, scannable horizontal 1D barcode as inline SVG. Used for
 * membership codes (e.g. "CV000008", Code 39) and booking codes (e.g.
 * "BK202607...", Code 128). See `@/utils/code39` / `@/utils/code128` for
 * the encodings.
 */
interface Props {
    value: string;
    /** Height of the bars in px. */
    height?: number;
    /** Narrow-element width in px (wide = 3×). */
    unit?: number;
    /** Barcode symbology. Defaults to Code 39. */
    format?: "code39" | "code128";
}

const Barcode: FC<Props> = ({ value, height = 60, unit = 2, format = "code39" }) => {
    const clean = format === "code128" ? value.trim() : value.trim().toUpperCase();
    const geo = useMemo(
        () => (format === "code128" ? buildCode128(clean, unit) : buildCode39(clean, unit)),
        [clean, unit, format],
    );
    if (!geo) return null;

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${geo.width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Barcode ${clean}`}
            shapeRendering="crispEdges"
        >
            <rect x={0} y={0} width={geo.width} height={height} fill="#ffffff" />
            {geo.rects.map((r, i) => (
                <rect key={i} x={r.x} y={0} width={r.w} height={height} fill="#111111" />
            ))}
        </svg>
    );
};

export default Barcode;
