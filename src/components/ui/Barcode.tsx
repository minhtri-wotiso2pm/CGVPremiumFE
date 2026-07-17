import { type FC, useMemo } from "react";
import { buildCode39 } from "@/utils/code39";

/**
 * Renders a real, scannable horizontal Code 39 barcode as inline SVG.
 * Used for membership codes (e.g. "CV000008") and booking codes
 * (e.g. "BK202607..."). See `@/utils/code39` for the encoding.
 */
interface Props {
    value: string;
    /** Height of the bars in px. */
    height?: number;
    /** Narrow-element width in px (wide = 3×). */
    unit?: number;
}

const Barcode: FC<Props> = ({ value, height = 60, unit = 2 }) => {
    const clean = value.trim().toUpperCase();
    const geo = useMemo(() => buildCode39(clean, unit), [clean, unit]);
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
