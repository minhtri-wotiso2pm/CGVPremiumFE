/**
 * Code 39 ("3 of 9") barcode geometry — no external library. Shared by the
 * React <Barcode> component and the print-window bill (which needs a plain
 * SVG string). Code 39 fits our codes exactly (uppercase letters + digits),
 * needs no checksum, and every character is 9 elements (bar/space/bar/…) with
 * 3 wide. `*` frames the payload as the start/stop symbol.
 */

const CODE39: Record<string, string> = {
    "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn",
    "4": "nnnwwnnnw", "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw",
    "8": "wnnwnnwnn", "9": "nnwwnnwnn", A: "wnnnnwnnw", B: "nnwnnwnnw",
    C: "wnwnnwnnn", D: "nnnnwwnnw", E: "wnnnwwnnn", F: "nnwnwwnnn",
    G: "nnnnnwwnw", H: "wnnnnwwnn", I: "nnwnnwwnn", J: "nnnnwwwnn",
    K: "wnnnnnnww", L: "nnwnnnnww", M: "wnwnnnnwn", N: "nnnnwnnww",
    O: "wnnnwnnwn", P: "nnwnwnnwn", Q: "nnnnnnwww", R: "wnnnnnwwn",
    S: "nnwnnnwwn", T: "nnnnwnwwn", U: "wwnnnnnnw", V: "nwwnnnnnw",
    W: "wwwnnnnnn", X: "nwnnwnnnw", Y: "wwnnwnnnn", Z: "nwwnwnnnn",
    "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", $: "nwnwnwnnn",
    "/": "nwnwnnnwn", "+": "nwnnnwnwn", "%": "nnnwnwnwn", "*": "nwnnwnwnn",
};

export interface BarcodeGeometry {
    rects: { x: number; w: number }[];
    width: number;
}

/** Returns bar rectangles for `value`, or null if any character is unencodable. */
export function buildCode39(value: string, unit = 2): BarcodeGeometry | null {
    const clean = value.trim().toUpperCase();
    if (!clean || [...clean].some((c) => !(c in CODE39))) return null;

    const chars = ["*", ...clean, "*"];
    const rects: { x: number; w: number }[] = [];
    let x = 0;
    chars.forEach((ch, ci) => {
        const pattern = CODE39[ch];
        for (let i = 0; i < pattern.length; i++) {
            const w = (pattern[i] === "w" ? 3 : 1) * unit;
            if (i % 2 === 0) rects.push({ x, w }); // even index → bar
            x += w;
        }
        if (ci < chars.length - 1) x += unit; // inter-character narrow gap
    });
    return { rects, width: x };
}

/** Standalone `<svg>` string (white background, dark bars) for print windows. */
export function code39SvgString(value: string, height = 60, unit = 2): string {
    const geo = buildCode39(value, unit);
    if (!geo) return "";
    const bars = geo.rects
        .map((r) => `<rect x="${r.x}" y="0" width="${r.w}" height="${height}" fill="#111"/>`)
        .join("");
    return (
        `<svg width="${geo.width}" height="${height}" viewBox="0 0 ${geo.width} ${height}" ` +
        `shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">` +
        `<rect x="0" y="0" width="${geo.width}" height="${height}" fill="#fff"/>${bars}</svg>`
    );
}
