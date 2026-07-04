export const VOUCHER_QUERY_KEY = "vouchers";

export const VOUCHER_PAGE_SIZE = 10;

export const DISCOUNT_TYPE_OPTIONS = [
    { value: "percent", label: "Percentage (%)" },
    { value: "fixed", label: "Fixed amount (₫)" },
] as const;

/** Backend only accepts these exact values (case-sensitive). */
export const VOUCHER_CATEGORY_OPTIONS = [
    { value: "Discount", label: "Discount" },
    { value: "Combo", label: "Combo" },
    { value: "Cashback", label: "Cashback" },
] as const;

export const DEFAULT_VOUCHER_CATEGORY = "Discount";
