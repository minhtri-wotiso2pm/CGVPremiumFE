import { type FC, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useVouchers } from "@/features/vouchers/hooks/useVouchers";
import type { Voucher } from "@/features/vouchers/types/voucher.types";
import "../promotions.css";

const fmtDate = (iso: string) => (iso ? dayjs(iso.slice(0, 10)).format("DD/MM/YYYY") : "—");

const discountLabel = (v: Voucher) =>
    v.discountType === "percent"
        ? { value: `${v.discountValue}`, unit: "% OFF" }
        : { value: `${v.discountValue.toLocaleString("vi-VN")}₫`, unit: "OFF" };

const PromoCard: FC<{ voucher: Voucher }> = ({ voucher }) => {
    const [copied, setCopied] = useState(false);
    const d = discountLabel(voucher);

    const handleCopy = () => {
        navigator.clipboard.writeText(voucher.voucherCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="promo-card">
            <div
                className={`promo-card__banner${voucher.imageUrl ? "" : " promo-card__banner--empty"}`}
                style={voucher.imageUrl ? { backgroundImage: `url(${voucher.imageUrl})` } : undefined}
            >
                <div className="promo-card__discount">
                    {d.value}<span>{d.unit}</span>
                </div>
            </div>
            <div className="promo-card__body">
                <p className="promo-card__desc">{voucher.description || "Special promotion — apply this code at checkout."}</p>
                <div className="promo-card__meta">
                    {voucher.minOrderValue > 0 && (
                        <span>Min order: {voucher.minOrderValue.toLocaleString("vi-VN")}₫</span>
                    )}
                    <span>Valid until {fmtDate(voucher.validUntil)}</span>
                </div>
                <div className="promo-card__code-row">
                    <div className="promo-card__code">{voucher.voucherCode}</div>
                    <button
                        className={`promo-card__copy${copied ? " promo-card__copy--done" : ""}`}
                        onClick={handleCopy}
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PromotionsPage: FC = () => {
    const { data, isLoading } = useVouchers({ pageIndex: 1, pageSize: 100 });

    const activeVouchers = useMemo(() => {
        const now = dayjs();
        return (data?.items ?? []).filter(
            (v) => v.isActive && (!v.validUntil || dayjs(v.validUntil).isAfter(now)),
        );
    }, [data]);

    return (
        <div className="promo-page">
            <div className="promo-head">
                <span className="promo-head__eyebrow">CGV Premium</span>
                <h1 className="promo-head__title">Promotions &amp; Offers</h1>
                <p className="promo-head__sub">Exclusive deals to make every visit more rewarding.</p>
            </div>

            {isLoading ? (
                <div className="promo-grid">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="promo-skel" />)}
                </div>
            ) : activeVouchers.length === 0 ? (
                <div className="promo-empty">
                    <p style={{ margin: 0, fontSize: 16 }}>No active promotions right now.</p>
                    <p style={{ margin: "6px 0 0", fontSize: 14 }}>Check back soon for exclusive offers.</p>
                </div>
            ) : (
                <div className="promo-grid">
                    {activeVouchers.map((v) => <PromoCard key={v.voucherId} voucher={v} />)}
                </div>
            )}
        </div>
    );
};

export default PromotionsPage;
