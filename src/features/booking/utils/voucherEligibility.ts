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

/** Everything about the current order the picker can evaluate rules against. */
export interface EligibilityContext {
    seatsSubTotal: number;
    fnBSubTotal: number;
    /** Cinema of the current showtime — for `Cinema` rules. Undefined ⇒ skip. */
    cinemaId?: number;
    /** ISO start time of the showtime — for `DayOfWeek` rules. Undefined ⇒ skip. */
    startTime?: string;
}

export interface VoucherEligibility {
    eligible: boolean;
    /** Short English reason shown when not eligible; undefined when eligible. */
    reason?: string;
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
 * customer. Deliberately lenient: only the rules we can actually evaluate
 * client-side with the data on hand (ApplyScope, minOrderValue, Cinema,
 * DayOfWeek) ever mark a voucher ineligible. Anything we can't verify
 * (Movie, Room, SeatType, Membership, PaymentMethod, Product, FoodCategory)
 * is left for the server to reject at apply time — better a rare inline
 * "not valid" than wrongly greying out a voucher the customer could use.
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
        if (s === "ticket") return { eligible: false, reason: "No tickets in this order" };
        if (s === "fnb" || s === "food" || s === "foodandbeverage")
            return { eligible: false, reason: "No food & drinks in this order" };
    }

    // Minimum order value — measured against the scope's subtotal.
    const min = input.minOrderValue ?? 0;
    if (min > 0 && base < min) {
        return { eligible: false, reason: `Spend at least ${formatPrice(min)} to use` };
    }

    // Cinema restriction.
    const cinemaRule = rules.find((r) => r.ruleType === "Cinema");
    if (cinemaRule?.ruleValue && ctx.cinemaId != null) {
        const allowed = splitList(cinemaRule.ruleValue);
        if (!allowed.includes(String(ctx.cinemaId))) {
            return { eligible: false, reason: "Not valid at this cinema" };
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
                return { eligible: false, reason: `Only valid on ${allowed
                    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
                    .join(", ")}` };
            }
        }
    }

    return { eligible: true };
}
