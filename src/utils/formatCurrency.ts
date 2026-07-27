/**
 * Shared money/number formatters. VND always renders with vi-VN digit
 * grouping ("123.000 ₫") in both languages — the grouping is a brand
 * decision, not a locale preference.
 */
export const formatVnd = (amount: number): string =>
    `${amount.toLocaleString("vi-VN")} ₫`;

export const formatNumber = (value: number): string =>
    value.toLocaleString("vi-VN");
