import { type FC, useMemo } from "react";
import { Skeleton } from "antd";
import { useFnbProducts } from "@/features/booking/hooks/useFnbProducts";
import { formatPrice } from "@/features/booking/utils/seat.utils";
import type { Product } from "@/features/booking/types/fnb.types";
import type { CounterFnbLine } from "../../types/counter.types";
import { FnbOnlyIcon, MinusIcon, PlusIcon } from "./icons";
import styles from "./counter.module.css";

const GROUP_LABELS: Record<string, string> = {
    combo: "COMBO", snack: "SNACKS", food: "FOOD", drink: "DRINKS", beverage: "DRINKS",
};
const GROUP_ORDER = ["combo", "snack", "drink", "beverage", "food"];

function groupProducts(products: Product[]) {
    const map = new Map<string, Product[]>();
    for (const p of products) {
        const key = (p.itemType ?? "other").toLowerCase();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(p);
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => {
            const ia = GROUP_ORDER.indexOf(a), ib = GROUP_ORDER.indexOf(b);
            if (ia === -1 && ib === -1) return 0;
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        })
        .map(([type, items]) => ({ type, label: GROUP_LABELS[type] ?? type.toUpperCase(), items }));
}

interface Props {
    cinemaId: number | undefined;
    fnb: Map<number, CounterFnbLine>;
    onAdd: (itemId: number, name: string, unitPrice: number) => void;
    onDec: (itemId: number) => void;
}

const CounterFnbGrid: FC<Props> = ({ cinemaId, fnb, onAdd, onDec }) => {
    const { data, isLoading, isError, refetch } = useFnbProducts(cinemaId);
    const products = useMemo(() => data?.products ?? [], [data]);
    const groups = useMemo(() => groupProducts(products), [products]);

    if (isLoading) {
        return (
            <div className={styles.fnbGrid}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={styles.fnbCard}>
                        <Skeleton.Image active style={{ width: "100%", height: 96 }} />
                        <div style={{ padding: 12 }}>
                            <Skeleton active title={false} paragraph={{ rows: 2 }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="dash-empty" style={{ padding: 40, textAlign: "center" }}>
                <p style={{ color: "var(--dash-text-2)", marginBottom: 12 }}>Couldn't load products.</p>
                <button className={styles.addBtn} style={{ maxWidth: 160, margin: "0 auto" }} onClick={() => refetch()}>
                    Retry
                </button>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div style={{ padding: 40, textAlign: "center", color: "var(--dash-text-3)" }}>
                <FnbOnlyIcon size={40} />
                <p style={{ marginTop: 12, color: "var(--dash-text-2)" }}>No products available at this cinema.</p>
            </div>
        );
    }

    return (
        <div>
            {groups.map(({ type, label, items }) => (
                <div key={type} className={styles.fnbGroup}>
                    <p className={styles.fnbGroupTitle}>{label}</p>
                    <div className={styles.fnbGrid}>
                        {items.map((p) => {
                            const qty = fnb.get(p.itemID)?.quantity ?? 0;
                            return (
                                <div key={p.itemID} className={`${styles.fnbCard} ${qty > 0 ? styles.fnbCardActive : ""}`}>
                                    {p.imageURL ? (
                                        <img className={styles.fnbThumb} src={p.imageURL} alt={p.itemName} loading="lazy" />
                                    ) : (
                                        <div className={`${styles.fnbThumb} ${styles.fnbThumbPh}`}><FnbOnlyIcon size={28} /></div>
                                    )}
                                    <div className={styles.fnbInfo}>
                                        <span className={styles.fnbName}>{p.itemName}</span>
                                        <span className={styles.fnbPrice}>{formatPrice(p.price)}</span>
                                        <div className={styles.fnbCardFoot}>
                                            {qty === 0 ? (
                                                <button className={styles.addBtn} onClick={() => onAdd(p.itemID, p.itemName, p.price)}>
                                                    <PlusIcon size={16} /> Add
                                                </button>
                                            ) : (
                                                <div className={styles.qtyRow}>
                                                    <button className={styles.qtyBtn} onClick={() => onDec(p.itemID)} aria-label="Remove one">
                                                        <MinusIcon size={16} />
                                                    </button>
                                                    <span className={styles.qtyVal}>{qty}</span>
                                                    <button className={styles.qtyBtn} onClick={() => onAdd(p.itemID, p.itemName, p.price)} aria-label="Add one">
                                                        <PlusIcon size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CounterFnbGrid;
