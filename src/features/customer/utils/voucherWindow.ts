import dayjs from "dayjs";

/**
 * True when `now` falls within [validFrom, validUntil]. `/vouchers/redeemable`
 * has no `isActive` field, so this validity window is the only client-side
 * signal available to keep expired (or not-yet-started) loyalty vouchers out
 * of the redeem catalog.
 */
export const isWithinValidityWindow = (validFrom: string, validUntil: string): boolean => {
    const now = dayjs();
    if (validFrom && dayjs(validFrom).isAfter(now)) return false;
    if (validUntil && dayjs(validUntil).isBefore(now)) return false;
    return true;
};
