import { formatPrice } from "./seat.utils";

/** Minimal rule shape both endpoints expose: `/vouchers/my-vouchers` &
 *  `/vouchers/redeemable` (VoucherRuleDisplay) and the admin-shaped public
 *  `/vouchers` (VoucherRule) each carry `ruleType` + `ruleValue`. */
export interface EligibilityRuleLike {
    ruleType: string;
    ruleValue?: string;
}

export interface VoucherEligibilityInput {
    minOrderValue?: number;
    rules: EligibilityRuleLike[];
}

/** Everything about the current order the picker can evaluate rules against.
 *  Every field beyond the subtotals is optional: a rule is only ever enforced
 *  when the matching context is supplied, so a caller that can't provide (say)
 *  the seat types simply lets the server be the final gate for `SeatType`. */
export interface EligibilityContext {
    seatsSubTotal: number;
    fnBSubTotal: number;
    /** Cinema of the current showtime — for `Cinema` rules. Undefined ⇒ skip. */
    cinemaId?: number;
    /** ISO start time of the showtime — for `DayOfWeek` rules. Undefined ⇒ skip. */
    startTime?: string;
    /** Movie of the current showtime — for `Movie` rules. */
    movieId?: number;
    /** Seat types in the order (e.g. ["STANDARD","COUPLE"]) — for `SeatType` rules. */
    seatTypes?: string[];
    /** The member's tier (e.g. "MegaVip") — for `Membership` rules. */
    membershipTier?: string | null;
    /** F&B item ids in the order — for `Product` rules. Provided (even empty)
     *  means "products are known", so a Product rule with no match is enforced. */
    productIds?: number[];
}

export interface VoucherEligibility {
    eligible: boolean;
    /** i18n key for the reason shown when not eligible; undefined when eligible.
     *  The caller resolves it with t(reasonKey, reasonParams). */
    reasonKey?: string;
    reasonParams?: Record<string, string>;
}

const DAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

/** Which subtotal a rule/discount is measured against, from an ApplyScope rule. */
function baseForScope(scope: string, ctx: EligibilityContext): number {
    const s = scope.toLowerCase();
    if (s === "ticket") return ctx.seatsSubTotal;
    if (s === "fnb" || s === "food" || s === "foodandbeverage") return ctx.fnBSubTotal;
    return ctx.seatsSubTotal + ctx.fnBSubTotal; // "order" / unknown → whole order
}

function splitList(value: string): string[] {
    return value.split(",").map((v) => v.trim()).filter(Boolean);
}

/**
 * Decides whether a voucher can be applied to the order in front of the
 * customer. Deliberately lenient: a rule only ever marks a voucher ineligible
 * when the matching order context is actually supplied. Callers that know the
 * cinema, day, movie, seat types, member tier, and F&B items (e.g. the staff
 * counter) get the full check; callers with less context enforce only what
 * they can and leave the rest (Room, PaymentMethod, FoodCategory, or anything
 * whose context is absent) for the server to reject at apply time.
 */
export function evaluateVoucherEligibility(
    input: VoucherEligibilityInput,
    ctx: EligibilityContext,
): VoucherEligibility {
    const rules = input.rules ?? [];
    const scopeRule = rules.find((r) => r.ruleType === "ApplyScope");
    const scope = scopeRule?.ruleValue ?? "Order";
    const base = baseForScope(scope, ctx);

    // Scope has nothing to discount in this order (e.g. a Ticket voucher on a
    // food-only order) — applying it would save nothing.
    if (base <= 0) {
        const s = scope.toLowerCase();
        if (s === "ticket") return { eligible: false, reasonKey: "voucherPicker.reasonNoTickets" };
        if (s === "fnb" || s === "food" || s === "foodandbeverage")
            return { eligible: false, reasonKey: "voucherPicker.reasonNoFnb" };
    }

    // Minimum order value — measured against the scope's subtotal.
    const min = input.minOrderValue ?? 0;
    if (min > 0 && base < min) {
        return {
            eligible: false,
            reasonKey: "voucherPicker.reasonMinOrder",
            reasonParams: { amount: formatPrice(min) },
        };
    }

    // Cinema restriction.
    const cinemaRule = rules.find((r) => r.ruleType === "Cinema");
    if (cinemaRule?.ruleValue && ctx.cinemaId != null) {
        const allowed = splitList(cinemaRule.ruleValue);
        if (!allowed.includes(String(ctx.cinemaId))) {
            return { eligible: false, reasonKey: "voucherPicker.reasonWrongCinema" };
        }
    }

    // Day-of-week restriction — checked against the showtime's day.
    const dowRule = rules.find((r) => r.ruleType === "DayOfWeek");
    if (dowRule?.ruleValue && ctx.startTime) {
        const parsed = new Date(ctx.startTime);
        if (!Number.isNaN(parsed.getTime())) {
            const showtimeDay = DAY_NAMES[parsed.getDay()];
            const allowed = splitList(dowRule.ruleValue).map((d) => d.toLowerCase());
            if (!allowed.includes(showtimeDay.toLowerCase())) {
                return {
                    eligible: false,
                    reasonKey: "voucherPicker.reasonWrongDay",
                    reasonParams: {
                        days: allowed
                            .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
                            .join(", "),
                    },
                };
            }
        }
    }

    // Movie restriction.
    const movieRule = rules.find((r) => r.ruleType === "Movie");
    if (movieRule?.ruleValue && ctx.movieId != null) {
        const allowed = splitList(movieRule.ruleValue);
        if (!allowed.includes(String(ctx.movieId))) {
            return { eligible: false, reasonKey: "voucherPicker.reasonWrongMovie" };
        }
    }

    // Seat-type restriction — order must include at least one seat of an
    // allowed type. Only enforced when the order actually has seats.
    const seatRule = rules.find((r) => r.ruleType === "SeatType");
    if (seatRule?.ruleValue && ctx.seatTypes && ctx.seatTypes.length > 0) {
        const allowed = splitList(seatRule.ruleValue).map((s) => s.toLowerCase());
        const hasMatch = ctx.seatTypes.some((t) => allowed.includes(t.toLowerCase()));
        if (!hasMatch) {
            return {
                eligible: false,
                reasonKey: "voucherPicker.reasonWrongSeatType",
                reasonParams: { types: splitList(seatRule.ruleValue).join(", ") },
            };
        }
    }

    // Membership-tier restriction.
    const memRule = rules.find((r) => r.ruleType === "Membership");
    if (memRule?.ruleValue && ctx.membershipTier != null) {
        const allowed = splitList(memRule.ruleValue).map((m) => m.toLowerCase());
        if (!allowed.includes(ctx.membershipTier.toLowerCase())) {
            return {
                eligible: false,
                reasonKey: "voucherPicker.reasonWrongMembership",
                reasonParams: { tier: splitList(memRule.ruleValue).join(", ") },
            };
        }
    }

    // Product restriction — order must contain one of the required F&B items.
    const productRule = rules.find((r) => r.ruleType === "Product");
    if (productRule?.ruleValue && ctx.productIds != null) {
        const allowed = splitList(productRule.ruleValue);
        const hasMatch = ctx.productIds.some((id) => allowed.includes(String(id)));
        if (!hasMatch) {
            return { eligible: false, reasonKey: "voucherPicker.reasonWrongProduct" };
        }
    }

    return { eligible: true };
}
