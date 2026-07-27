import { type FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Input, Tooltip } from "antd";
import dayjs from "dayjs";
import QrScanner from "../QrScanner";
import { useUserLookup } from "../../hooks/useUserLookup";
import { getCheckInErrorInfo } from "../../hooks/useCheckIn";
import type { CounterCustomer } from "../../types/counter.types";
import type { LookedUpMember, MemberVoucher } from "../../types/lookup.types";
import { formatPrice } from "@/features/booking/utils/seat.utils";
import { evaluateVoucherEligibility } from "@/features/booking/utils/voucherEligibility";
import { CheckIcon, PersonIcon, QrIcon } from "./icons";
import { LockIcon } from "@/components/ui/BrandIcons";
import styles from "./counter.module.css";

const { Search } = Input;

const initials = (name: string) =>
    name.trim().split(/\s+/).slice(-2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";

const fmtDiscount = (type: string, value: number) =>
    type === "percent" ? `${value}% off` : `${formatPrice(value)} off`;

const fmtValidUntil = (iso?: string): string => {
    if (!iso) return "";
    const d = dayjs(iso);
    return d.isValid() ? d.format("MMM D, YYYY") : "";
};

type Choice = "guest" | "member" | null;

interface Props {
    customer: CounterCustomer;
    voucherCode: string | null;
    onSetGuest: () => void;
    onSetMember: (member: LookedUpMember) => void;
    onSetVoucher: (code: string | null) => void;
    /** Order context so ineligible vouchers can be greyed out and unselectable. */
    seatsSubtotal?: number;
    fnbSubtotal?: number;
    cinemaId?: number;
    startTime?: string;
    movieId?: number;
    /** Seat types in the order (e.g. ["STANDARD","COUPLE"]). */
    seatTypes?: string[];
    /** F&B item ids in the order. */
    productIds?: number[];
}

const CustomerStep: FC<Props> = ({
    customer,
    voucherCode,
    onSetGuest,
    onSetMember,
    onSetVoucher,
    seatsSubtotal,
    fnbSubtotal,
    cinemaId,
    startTime,
    movieId,
    seatTypes,
    productIds,
}) => {
    const { t } = useTranslation("booking");
    const initialChoice: Choice = customer.resolved ? (customer.member ? "member" : "guest") : null;
    const [choice, setChoice] = useState<Choice>(initialChoice);
    const [lookupInput, setLookupInput] = useState("");
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const lookup = useUserLookup();
    const member = customer.member;

    const getEligibility = (v: MemberVoucher) =>
        evaluateVoucherEligibility(
            { minOrderValue: v.minOrderValue ?? 0, rules: v.voucherRules ?? [] },
            {
                seatsSubTotal: seatsSubtotal ?? 0,
                fnBSubTotal: fnbSubtotal ?? 0,
                cinemaId,
                startTime,
                movieId,
                seatTypes,
                membershipTier: member?.membership?.currentTier ?? null,
                productIds,
            },
        );

    const runLookup = (raw: string) => {
        const value = raw.trim();
        if (!value) return;
        setError(null);
        lookup.mutate(value, {
            onSuccess: (res) => {
                if (res.success && res.user) {
                    onSetMember(res.user);
                } else {
                    setError(res.message || "No member found for that email, phone, or barcode.");
                }
            },
            onError: (err) => setError(getCheckInErrorInfo(err, "Lookup failed.").message),
        });
    };

    return (
        <div className="dash-card" style={{ padding: 24 }}>
            <div className={styles.stepHeadRow}>
                <div>
                    <h2 className={styles.stepHeadTitle}>Customer</h2>
                    <p className={styles.stepHeadSub}>Attach a member for points &amp; wallet, or continue as guest.</p>
                </div>
            </div>

            <div className={styles.custChoices}>
                <button
                    type="button"
                    className={`${styles.custChoice} ${choice === "guest" ? styles.custChoiceActive : ""}`}
                    onClick={() => { setChoice("guest"); onSetGuest(); }}
                >
                    <span className={styles.custChoiceIcon}><PersonIcon size={22} /></span>
                    <span>
                        <div className={styles.custChoiceTitle}>Guest</div>
                        <div className={styles.custChoiceDesc}>No points, wallet, or vouchers.</div>
                    </span>
                </button>

                <button
                    type="button"
                    className={`${styles.custChoice} ${choice === "member" ? styles.custChoiceActive : ""}`}
                    onClick={() => setChoice("member")}
                >
                    <span className={styles.custChoiceIcon}><QrIcon size={22} /></span>
                    <span>
                        <div className={styles.custChoiceTitle}>Member</div>
                        <div className={styles.custChoiceDesc}>Look up by email, phone, or barcode.</div>
                    </span>
                </button>
            </div>

            {choice === "member" && (
                <>
                    <div className={styles.lookupBar}>
                        <Search
                            placeholder="Email, phone, or barcode (e.g. CV000008)"
                            value={lookupInput}
                            onChange={(e) => setLookupInput(e.target.value)}
                            onSearch={runLookup}
                            loading={lookup.isPending}
                            enterButton="Look up"
                            style={{ maxWidth: 360 }}
                            autoFocus
                        />
                        <Button onClick={() => setScanning((v) => !v)}>
                            {scanning ? "Stop camera" : "Scan card"}
                        </Button>
                    </div>

                    {scanning && (
                        <div style={{ maxWidth: 360, marginBottom: 14 }}>
                            <QrScanner
                                active={scanning}
                                qrbox={{ width: 300, height: 110 }}
                                onScan={(text) => { setLookupInput(text); runLookup(text); }}
                                onError={(m) => setError(m)}
                            />
                        </div>
                    )}

                    {error && (
                        <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} style={{ marginBottom: 14 }} />
                    )}

                    {member && (
                        <div className={styles.memberCard}>
                            {member.avatarURL ? (
                                <img className={styles.memberAvatar} src={member.avatarURL} alt={member.fullName} />
                            ) : (
                                <div className={styles.memberAvatar}>{initials(member.fullName)}</div>
                            )}
                            <div>
                                <div className={styles.memberName}>{member.fullName}</div>
                                <div className={styles.memberMeta}>
                                    {member.phone || member.email}
                                    {member.membership ? ` · ${member.membership.currentTier} tier` : ""}
                                </div>
                            </div>
                            <div className={styles.memberStats}>
                                <div className={styles.memberStat}>
                                    <div className={styles.memberStatLabel}>Points</div>
                                    <div className={styles.memberStatVal}>
                                        {(member.membership?.totalPoints ?? 0).toLocaleString("vi-VN")}
                                    </div>
                                </div>
                                <div className={styles.memberStat}>
                                    <div className={styles.memberStatLabel}>Wallet</div>
                                    <div className={styles.memberStatVal}>
                                        {formatPrice(member.wallet?.balance ?? 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Voucher picker — from the member's vouchers returned on lookup. */}
                    {member && (
                        member.vouchers.length > 0 ? (
                            <div className={styles.voucherSection}>
                                <div className={styles.voucherHead}>
                                    <p className={styles.railSection}>Voucher</p>
                                    {voucherCode && (
                                        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => onSetVoucher(null)}>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                                <div className={styles.voucherList}>
                                    {member.vouchers.map((v) => {
                                        const active = voucherCode === v.voucherCode;
                                        const { eligible, reasonKey, reasonParams } = getEligibility(v);
                                        const reason = reasonKey ? t(reasonKey, reasonParams) : "";
                                        const rules = v.voucherRules ?? [];
                                        return (
                                            <button
                                                key={v.voucherId}
                                                type="button"
                                                className={`${styles.voucherRow} ${active ? styles.voucherRowActive : ""} ${eligible ? "" : styles.voucherRowDisabled}`}
                                                onClick={() => eligible && onSetVoucher(active ? null : v.voucherCode)}
                                                disabled={!eligible}
                                                aria-disabled={!eligible}
                                            >
                                                {v.imageUrl && <img className={styles.voucherThumb} src={v.imageUrl} alt="" />}
                                                <span className={styles.voucherBody}>
                                                    <span className={styles.voucherTopRow}>
                                                        <span className={styles.voucherName}>{v.voucherCode}</span>
                                                        <span className={styles.voucherDiscount}>{fmtDiscount(v.discountType, v.discountValue)}</span>
                                                    </span>
                                                    {v.description && <span className={styles.voucherDesc}>{v.description}</span>}
                                                    <span className={styles.voucherMetaRow}>
                                                        {(v.minOrderValue ?? 0) > 0 && (
                                                            <span className={styles.voucherMetaChip}>Min. {formatPrice(v.minOrderValue!)}</span>
                                                        )}
                                                        {v.validUntil && (
                                                            <span className={styles.voucherMetaChip}>Until {fmtValidUntil(v.validUntil)}</span>
                                                        )}
                                                        {v.quantity != null && v.quantity > 1 && (
                                                            <span className={styles.voucherMetaChip}>×{v.quantity}</span>
                                                        )}
                                                    </span>
                                                    {rules.length > 0 && (
                                                        <span className={styles.voucherRuleTags}>
                                                            {rules.map((r, i) => (
                                                                <span key={`${r.ruleType}-${i}`} className={styles.voucherRuleTag}>
                                                                    {r.displayText || r.ruleType}
                                                                </span>
                                                            ))}
                                                        </span>
                                                    )}
                                                </span>
                                                {active ? (
                                                    <span className={styles.voucherCheck}><CheckIcon size={20} /></span>
                                                ) : !eligible ? (
                                                    <Tooltip title={reason}>
                                                        <span className={styles.voucherReason}>
                                                            <LockIcon size={11} /> {reason}
                                                        </span>
                                                    </Tooltip>
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.voucherSlot}>
                                <QrIcon size={18} />
                                <span>This member has no vouchers available to apply.</span>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
};

export default CustomerStep;
