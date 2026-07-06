export const formatVnd = (n: number): string => `${Math.round(n).toLocaleString("vi-VN")} ₫`;

export const formatNumber = (n: number): string => Math.round(n).toLocaleString("vi-VN");

export const formatPercent = (n: number, digits = 1): string => `${n.toFixed(digits)}%`;

/** Compact currency for tight spaces (chart axes, small labels): 1.2M ₫, 850K ₫. */
export const formatCompactVnd = (n: number): string => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B ₫`;
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₫`;
    if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K ₫`;
    return formatVnd(n);
};
