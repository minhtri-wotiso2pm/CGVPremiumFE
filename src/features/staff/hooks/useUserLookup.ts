import { useMutation } from "@tanstack/react-query";
import { lookupUserApi } from "@/services/api/user.service";
import type { LookupKey } from "../types/lookup.types";

/**
 * Auto-detects which of the three lookup keys a raw counter input is:
 *   - contains "@"            → email
 *   - all digits, 9–11 long   → phone
 *   - otherwise               → barcode (e.g. "CV000008")
 * So staff type/scan one field and never pick a type.
 */
export function detectLookupKey(raw: string): LookupKey {
    const value = raw.trim();
    if (value.includes("@")) return "email";
    const digits = value.replace(/[\s.\-()]/g, "");
    if (/^\d{9,11}$/.test(digits)) return "phone";
    return "barcode";
}

/** Normalizes the value for the detected key (strips phone separators). */
export function normalizeLookupValue(key: LookupKey, raw: string): string {
    const value = raw.trim();
    if (key === "phone") return value.replace(/[\s.\-()]/g, "");
    return value;
}

export function useUserLookup() {
    return useMutation({
        mutationFn: (raw: string) => {
            const key = detectLookupKey(raw);
            return lookupUserApi(key, normalizeLookupValue(key, raw));
        },
    });
}
