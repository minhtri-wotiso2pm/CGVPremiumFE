import type { FC } from "react";
import type { VoucherRuleDisplay } from "../types/loyaltyVoucher.types";
import styles from "./VoucherCard.module.css";

interface Props {
    rules: VoucherRuleDisplay[];
}

/** Renders a voucher's already-server-rendered rule display text as pill
 *  tags — no client-side ID resolution needed for this data (contrast with
 *  the public Promotions page's `VoucherRuleChips`, which resolves raw
 *  ruleType/ruleValue pairs from the admin-shaped `/vouchers` endpoint). */
const VoucherRuleTags: FC<Props> = ({ rules }) => {
    if (rules.length === 0) return null;
    return (
        <div className={styles.ruleTags}>
            {rules.map((r, i) => (
                <span key={`${r.ruleType}-${i}`} className={styles.ruleTag}>
                    {r.displayText}
                </span>
            ))}
        </div>
    );
};

export default VoucherRuleTags;
