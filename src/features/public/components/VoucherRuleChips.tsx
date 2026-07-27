import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
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
const describeRule = (t: TFunction, rule: VoucherRule, labels: VoucherRuleLabelMaps): string => {
    const { ruleType, ruleValue } = rule;
    switch (ruleType) {
        case "ApplyScope":
            return t("ruleChips.applyScope", { scope: ruleValue.toLowerCase() });
        case "Cinema":
            return t("ruleChips.cinema", { name: labels.cinemaNameById.get(ruleValue) ?? `#${ruleValue}` });
        case "Movie":
            return t("ruleChips.movie", { name: labels.movieTitleById.get(ruleValue) ?? `#${ruleValue}` });
        case "Room":
            return t("ruleChips.room", { name: labels.roomNameById.get(ruleValue) ?? `#${ruleValue}` });
        case "SeatType":
            return t("ruleChips.seatType", { types: formatMultiselect(ruleValue) });
        case "Membership":
            return t("ruleChips.membership", { tier: ruleValue });
        case "PaymentMethod":
            return t("ruleChips.paymentMethod", { method: ruleValue });
        case "DayOfWeek":
            return t("ruleChips.dayOfWeek", { days: formatMultiselect(ruleValue) });
        case "Product":
            return t("ruleChips.product");
        case "FoodCategory":
            return t("ruleChips.foodCategory", { category: ruleValue });
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
    const { t } = useTranslation("public");
    if (rules.length === 0) return null;
    return (
        <div className="promo-card__rules">
            {rules.map((rule, i) => (
                <span key={`${rule.ruleType}-${i}`} className="promo-card__rule-chip">
                    {describeRule(t, rule, labels)}
                </span>
            ))}
        </div>
    );
};

export default VoucherRuleChips;
