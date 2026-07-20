import type { FC } from "react";
import type { VoucherRule } from "@/features/vouchers/types/voucher.types";
import type { VoucherRuleLabelMaps } from "../hooks/useVoucherRuleLabels";

const MULTISELECT_DELIMITER = ",";

const formatMultiselect = (value: string): string =>
    value.split(MULTISELECT_DELIMITER).map((v) => v.trim()).filter(Boolean).join(", ");

/**
 * Turns one rule into a short human sentence. The rule-type metadata endpoint
 * (GET /vouchers/rule-types) is Admin-only, so — unlike the admin rule editor —
 * this page can't ask the server how to label each ruleType; these templates
 * are a small hardcoded map instead, covering the 10 documented rule types
 * with a readable fallback for anything unrecognized.
 */
const describeRule = (rule: VoucherRule, labels: VoucherRuleLabelMaps): string => {
    const { ruleType, ruleValue } = rule;
    switch (ruleType) {
        case "ApplyScope":
            return `Applies to ${ruleValue.toLowerCase()}`;
        case "Cinema":
            return `Cinema: ${labels.cinemaNameById.get(ruleValue) ?? `#${ruleValue}`}`;
        case "Movie":
            return `Movie: ${labels.movieTitleById.get(ruleValue) ?? `#${ruleValue}`}`;
        case "Room":
            return `Room: ${labels.roomNameById.get(ruleValue) ?? `#${ruleValue}`}`;
        case "SeatType":
            return `Seat type: ${formatMultiselect(ruleValue)}`;
        case "Membership":
            return `${ruleValue} members only`;
        case "PaymentMethod":
            return `Pay via ${ruleValue}`;
        case "DayOfWeek":
            return `Valid on ${formatMultiselect(ruleValue)}`;
        case "Product":
            return "Requires a specific item";
        case "FoodCategory":
            return `Requires ${ruleValue} category`;
        default:
            return `${ruleType}: ${ruleValue}`;
    }
};

interface Props {
    rules: VoucherRule[];
    labels: VoucherRuleLabelMaps;
}

/** Renders a voucher's restriction rules as small condition chips — the only
 *  place on the public site these are surfaced today. */
const VoucherRuleChips: FC<Props> = ({ rules, labels }) => {
    if (rules.length === 0) return null;
    return (
        <div className="promo-card__rules">
            {rules.map((rule, i) => (
                <span key={`${rule.ruleType}-${i}`} className="promo-card__rule-chip">
                    {describeRule(rule, labels)}
                </span>
            ))}
        </div>
    );
};

export default VoucherRuleChips;
