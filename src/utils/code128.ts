/**
 * Code 128 (Code Set B) barcode geometry — no external library. Shared by the
 * React <Barcode> component and the print-window bill (which needs a plain
 * SVG string). Code Set B covers ASCII 32–126 (digits, letters, punctuation),
 * which fits our booking codes exactly, and needs a mod-103 checksum.
 *
 * The BARS table below is the standard ISO/IEC 15417 Code 128 symbol table
 * (107 symbols, each 11 modules wide except the 13-module stop symbol) —
 * each number's decimal digits *are* the bar/space bit pattern (1 = bar,
 * 0 = space), read left to right.
 */

import type { BarcodeGeometry } from "./code39";

const BARS: number[] = [
    11011001100, 11001101100, 11001100110, 10010011000, 10010001100,
    10001001100, 10011001000, 10011000100, 10001100100, 11001001000,
    11001000100, 11000100100, 10110011100, 10011011100, 10011001110,
    10111001100, 10011101100, 10011100110, 11001110010, 11001011100,
    11001001110, 11011100100, 11001110100, 11101101110, 11101001100,
    11100101100, 11100100110, 11101100100, 11100110100, 11100110010,
    11011011000, 11011000110, 11000110110, 10100011000, 10001011000,
    10001000110, 10110001000, 10001101000, 10001100010, 11010001000,
    11000101000, 11000100010, 10110111000, 10110001110, 10001101110,
    10111011000, 10111000110, 10001110110, 11101110110, 11010001110,
    11000101110, 11011101000, 11011100010, 11011101110, 11101011000,
    11101000110, 11100010110, 11101101000, 11101100010, 11100011010,
    11101111010, 11001000010, 11110001010, 10100110000, 10100001100,
    10010110000, 10010000110, 10000101100, 10000100110, 10110010000,
    10110000100, 10011010000, 10011000010, 10000110100, 10000110010,
    11000010010, 11001010000, 11110111010, 11000010100, 10001111010,
    10100111100, 10010111100, 10010011110, 10111100100, 10011110100,
    10011110010, 11110100100, 11110010100, 11110010010, 11011011110,
    11011110110, 11110110110, 10101111000, 10100011110, 10001011110,
    10111101000, 10111100010, 11110101000, 11110100010, 10111011110,
    10111101110, 11101011110, 11110101110, 11010000100, 11010010000,
    11010011100, 1100011101011,
];

const START_B = 104;
const STOP = 106;

/** Splits a symbol's bit string into alternating bar/space module widths. */
function patternWidths(symbol: number, unit: number): number[] {
    const bits = BARS[symbol].toString();
    const widths: number[] = [];
    let run = 1;
    for (let i = 1; i < bits.length; i++) {
        if (bits[i] === bits[i - 1]) {
            run++;
        } else {
            widths.push(run * unit);
            run = 1;
        }
    }
    widths.push(run * unit);
    return widths;
}

/** Returns bar rectangles for `value`, or null if any character falls outside Set B (ASCII 32–126). */
export function buildCode128(value: string, unit = 2): BarcodeGeometry | null {
    const clean = value.trim();
    if (!clean || [...clean].some((c) => { const code = c.charCodeAt(0); return code < 32 || code > 126; })) {
        return null;
    }

    const values = [...clean].map((c) => c.charCodeAt(0) - 32);
    let checksum = START_B;
    values.forEach((v, i) => { checksum += v * (i + 1); });
    checksum %= 103;

    const symbols = [START_B, ...values, checksum, STOP];

    const rects: { x: number; w: number }[] = [];
    let x = 0;
    symbols.forEach((sym) => {
        const widths = patternWidths(sym, unit);
        widths.forEach((w, i) => {
            if (i % 2 === 0) rects.push({ x, w }); // even index → bar
            x += w;
        });
    });
    return { rects, width: x };
}

/** Standalone `<svg>` string (white background, dark bars) for print windows. */
export function code128SvgString(value: string, height = 60, unit = 2): string {
    const geo = buildCode128(value, unit);
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
