import { type FC, useMemo, useState } from "react";
import { Skeleton, Modal } from "antd";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    useWalletSummary,
    useWalletTransactions,
    useWalletTransactionsForChart,
    useWalletTransactionDetail,
} from "../hooks/useWallet";
import type { WalletTransaction, WalletTransactionFilters, WalletTransactionType } from "../types/wallet.types";
import styles from "./WalletPage.module.css";

/* ─────────────────────────────────────────
   Icons
───────────────────────────────────────── */
const WalletIcon: FC<{ size?: number }> = ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 7a2 2 0 012-2h13a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="3" y="7" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M15.5 13.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="currentColor" />
    </svg>
);

const TopUpIcon: FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const RefundIcon: FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 10A8 8 0 1111 20.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const PaymentIcon: FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const EmptyHistoryIcon: FC = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
        <path d="M15 16h18M15 22h12M15 28h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.2" />
        <circle cx="34" cy="34" r="8" fill="rgba(232,0,28,0.08)" stroke="#E8001C" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M34 30v4.5M34 37v.5" stroke="#E8001C" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
);

const ErrorIcon: FC = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
        <path d="M20 12v10M20 26v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
);

/* ─────────────────────────────────────────
   Formatters
───────────────────────────────────────── */
const fmtCurrency = (n: number) =>
    n === 0 ? "0 ₫" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const TYPE_CFG: Record<string, { label: string; color: string; bg: string; Icon: FC }> = {
    top_up: { label: "Top Up", color: "#4ADE80", bg: "rgba(74,222,128,0.1)", Icon: TopUpIcon },
    refund: { label: "Refund", color: "#60A5FA", bg: "rgba(96,165,250,0.1)", Icon: RefundIcon },
    payment: { label: "Payment", color: "#F87171", bg: "rgba(248,113,113,0.1)", Icon: PaymentIcon },
};

const getTypeCfg = (type: string) => TYPE_CFG[type] ?? TYPE_CFG.payment;

/* ─────────────────────────────────────────
   Balance Hero
───────────────────────────────────────── */
const BalanceHero: FC<{ summary: { currentBalance: number; totalRefundReceived: number; totalSpent: number; transactionCount: number } }> = ({ summary }) => (
    <div className={`${styles.card} ${styles.hero}`}>
        <div className={styles.heroGlow} />
        <div className={styles.heroBody}>
            <div className={styles.balanceBadge}>
                <div className={styles.balanceIconWrap}>
                    <WalletIcon />
                </div>
                <div className={styles.balanceMeta}>
                    <span className={styles.balanceEyebrow}>Current Balance</span>
                    <span className={styles.balanceValue}>{fmtCurrency(summary.currentBalance)}</span>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCell}>
                    <span className={styles.statValue} style={{ color: "#60A5FA" }}>
                        {fmtCurrency(summary.totalRefundReceived)}
                    </span>
                    <span className={styles.statLabel}>Total Refunded</span>
                </div>
                <div className={styles.statCell}>
                    <span className={styles.statValue} style={{ color: "#F87171" }}>
                        {fmtCurrency(summary.totalSpent)}
                    </span>
                    <span className={styles.statLabel}>Total Spent</span>
                </div>
                <div className={styles.statCell}>
                    <span className={styles.statValue}>{summary.transactionCount}</span>
                    <span className={styles.statLabel}>Transactions</span>
                </div>
            </div>
        </div>
    </div>
);

/* ─────────────────────────────────────────
   Chart: spent vs received over time
───────────────────────────────────────── */
const WalletChart: FC = () => {
    const { data, isLoading } = useWalletTransactionsForChart();

    const chartData = useMemo(() => {
        const txs = data?.transactions ?? [];
        if (txs.length === 0) return [];

        const buckets = new Map<string, { date: string; spent: number; received: number }>();
        for (const tx of txs) {
            const key = tx.createdAt.slice(0, 10);
            const bucket = buckets.get(key) ?? { date: key, spent: 0, received: 0 };
            if (tx.transactionType === "payment") {
                bucket.spent += Math.abs(tx.amount);
            } else if (tx.transactionType === "refund" || tx.transactionType === "top_up") {
                bucket.received += tx.amount;
            }
            buckets.set(key, bucket);
        }

        return Array.from(buckets.values())
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-14)
            .map((b) => ({
                ...b,
                label: new Date(b.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
            }));
    }, [data]);

    return (
        <div className={`${styles.card} ${styles.chartSection}`}>
            <p className={styles.sectionTitle}>Spending vs Refund / Top Up</p>

            {isLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : chartData.length === 0 ? (
                <div className={styles.chartEmpty}>No transaction data to chart yet.</div>
            ) : (
                <>
                    <div className={styles.chartLegend}>
                        <span className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: "#F87171" }} /> Spent
                        </span>
                        <span className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: "#4ADE80" }} /> Refund / Top Up
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="label" stroke="#5a4040" fontSize={11} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
                            <YAxis
                                stroke="#5a4040"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                contentStyle={{
                                    background: "#1a0f0f",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 10,
                                    fontSize: 12,
                                }}
                                labelStyle={{ color: "#f0e8e8", fontWeight: 700 }}
                                formatter={(value, name) => [fmtCurrency(Number(value) || 0), name === "spent" ? "Spent" : "Refund / Top Up"]}
                            />
                            <Bar dataKey="spent" fill="#F87171" radius={[4, 4, 0, 0]} maxBarSize={22} />
                            <Bar dataKey="received" fill="#4ADE80" radius={[4, 4, 0, 0]} maxBarSize={22} />
                        </BarChart>
                    </ResponsiveContainer>
                </>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────
   Transaction row
───────────────────────────────────────── */
const TransactionRow: FC<{ tx: WalletTransaction; onClick: () => void }> = ({ tx, onClick }) => {
    const cfg = getTypeCfg(tx.transactionType);
    const isPositive = tx.amount >= 0;

    return (
        <button type="button" className={styles.historyRow} onClick={onClick}>
            <div className={styles.historyTypeBadge} style={{ background: cfg.bg, color: cfg.color }}>
                <cfg.Icon />
            </div>

            <div className={styles.historyInfo}>
                <p className={styles.historyDesc}>{tx.description || cfg.label}</p>
                <p className={styles.historyMeta}>
                    {fmtDate(tx.createdAt)} · {fmtTime(tx.createdAt)}
                    {tx.bookingCode ? ` · ${tx.bookingCode}` : ""}
                </p>
            </div>

            <div className={styles.historyAmountWrap}>
                <span className={styles.historyAmount} style={{ color: cfg.color }}>
                    {isPositive ? "+" : ""}
                    {fmtCurrency(tx.amount)}
                </span>
                <span className={styles.historyBalance}>Balance: {fmtCurrency(tx.balanceAfter)}</span>
            </div>
        </button>
    );
};

/* ─────────────────────────────────────────
   Transaction detail modal
───────────────────────────────────────── */
const TransactionDetailModal: FC<{ transactionId: number | null; onClose: () => void }> = ({ transactionId, onClose }) => {
    const { data, isLoading, isError } = useWalletTransactionDetail(transactionId);
    const cfg = data ? getTypeCfg(data.transactionType) : null;

    return (
        <Modal
            open={transactionId != null}
            onCancel={onClose}
            title={<span className={styles.modalTitle}>Transaction Detail</span>}
            footer={null}
            destroyOnClose
            styles={{
                container: { background: "#1a0f0f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" },
                header: { background: "#1a0f0f", borderBottom: "1px solid rgba(255,255,255,0.06)" },
                mask: { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.7)" },
            }}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 5 }} />
            ) : isError || !data ? (
                <div className={styles.errorState} style={{ padding: "24px 0" }}>
                    <div style={{ color: "#5a4040" }}><ErrorIcon /></div>
                    <p className={styles.emptyTitle}>Could not load this transaction</p>
                    <p className={styles.emptyText}>It may not exist or does not belong to your wallet.</p>
                </div>
            ) : (
                <>
                    <p className={styles.detailAmountBig} style={{ color: cfg!.color }}>
                        {data.amount >= 0 ? "+" : ""}
                        {fmtCurrency(data.amount)}
                    </p>
                    <div className={styles.detailList}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Type</span>
                            <span className={styles.detailValue} style={{ color: cfg!.color }}>{cfg!.label}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Transaction ID</span>
                            <span className={styles.detailValue}>#{data.transactionID}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Balance After</span>
                            <span className={styles.detailValue}>{fmtCurrency(data.balanceAfter)}</span>
                        </div>
                        {data.bookingCode && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Booking Code</span>
                                <span className={styles.detailValue}>{data.bookingCode}</span>
                            </div>
                        )}
                        {data.refundID != null && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Refund ID</span>
                                <span className={styles.detailValue}>#{data.refundID}</span>
                            </div>
                        )}
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Date & Time</span>
                            <span className={styles.detailValue}>{fmtDate(data.createdAt)} · {fmtTime(data.createdAt)}</span>
                        </div>
                        {data.description && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Description</span>
                                <span className={styles.detailValue}>{data.description}</span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </Modal>
    );
};

/* ─────────────────────────────────────────
   Skeleton
───────────────────────────────────────── */
const WalletSkeleton: FC = () => (
    <div className={styles.page}>
        <div className={styles.skeletonHero}><Skeleton active paragraph={{ rows: 3 }} /></div>
        <div className={`${styles.card} ${styles.chartSection}`}><Skeleton active paragraph={{ rows: 4 }} /></div>
        <div className={`${styles.card} ${styles.historySection}`}><Skeleton active paragraph={{ rows: 4 }} /></div>
    </div>
);

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
const PAGE_SIZE = 10;
const DEFAULT_FILTERS: WalletTransactionFilters = { page: 1, pageSize: PAGE_SIZE };

const WalletPage: FC = () => {
    const [filters, setFilters] = useState<WalletTransactionFilters>(DEFAULT_FILTERS);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useWalletSummary();
    const { data: txData, isLoading: txLoading, isError: txError, refetch: refetchTx } = useWalletTransactions(filters);

    const transactions = txData?.transactions ?? [];
    const totalCount = txData?.totalCount ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

    const updateFilter = (patch: Partial<WalletTransactionFilters>) => {
        setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
    };

    const resetFilters = () => setFilters(DEFAULT_FILTERS);

    const hasActiveFilters =
        !!filters.transactionType || !!filters.fromDate || !!filters.toDate;

    if (summaryLoading) return <WalletSkeleton />;

    if (summaryError || !summary) {
        return (
            <div className={`${styles.card} ${styles.errorState}`}>
                <div style={{ color: "#5a4040" }}><ErrorIcon /></div>
                <p className={styles.emptyTitle}>Failed to load wallet</p>
                <p className={styles.emptyText}>Please try again later.</p>
                <button className={styles.retryBtn} onClick={() => refetchSummary()}>Retry</button>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <BalanceHero summary={summary} />
            <WalletChart />

            <div className={`${styles.card} ${styles.historySection}`}>
                <div className={styles.historyHeader}>
                    <p className={styles.sectionTitle} style={{ margin: 0 }}>Transaction History</p>
                    {totalCount > 0 && (
                        <span className={styles.historyCount}>{totalCount} transaction{totalCount !== 1 ? "s" : ""}</span>
                    )}
                </div>

                <div className={styles.filtersBar}>
                    <div className={styles.filterField}>
                        <label className={styles.filterLabel} htmlFor="wallet-type-filter">Type</label>
                        <select
                            id="wallet-type-filter"
                            className={styles.filterSelect}
                            value={filters.transactionType ?? ""}
                            onChange={(e) =>
                                updateFilter({
                                    transactionType: (e.target.value || undefined) as WalletTransactionType | undefined,
                                })
                            }
                        >
                            <option value="">All types</option>
                            <option value="top_up">Top Up</option>
                            <option value="payment">Payment</option>
                            <option value="refund">Refund</option>
                        </select>
                    </div>

                    <div className={styles.filterField}>
                        <label className={styles.filterLabel} htmlFor="wallet-from-date">From</label>
                        <input
                            id="wallet-from-date"
                            type="date"
                            className={styles.filterDate}
                            value={filters.fromDate?.slice(0, 10) ?? ""}
                            onChange={(e) => updateFilter({ fromDate: e.target.value ? `${e.target.value}T00:00:00` : undefined })}
                        />
                    </div>

                    <div className={styles.filterField}>
                        <label className={styles.filterLabel} htmlFor="wallet-to-date">To</label>
                        <input
                            id="wallet-to-date"
                            type="date"
                            className={styles.filterDate}
                            value={filters.toDate?.slice(0, 10) ?? ""}
                            onChange={(e) => updateFilter({ toDate: e.target.value ? `${e.target.value}T23:59:59` : undefined })}
                        />
                    </div>

                    {hasActiveFilters && (
                        <button className={styles.resetBtn} onClick={resetFilters}>Clear filters</button>
                    )}
                </div>

                {txLoading && !txData ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                ) : txError ? (
                    <div className={styles.errorState}>
                        <div style={{ color: "#5a4040" }}><ErrorIcon /></div>
                        <p className={styles.emptyTitle}>Failed to load transactions</p>
                        <p className={styles.emptyText}>Please try again.</p>
                        <button className={styles.retryBtn} onClick={() => refetchTx()}>Retry</button>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className={styles.emptyHistory}>
                        <div className={styles.emptyIconWrap}><EmptyHistoryIcon /></div>
                        <p className={styles.emptyTitle}>
                            {hasActiveFilters ? "No transactions match your filters" : "No transactions yet"}
                        </p>
                        <p className={styles.emptyText}>
                            {hasActiveFilters
                                ? "Try adjusting the type or date range."
                                : "Your wallet transactions will appear here after your first top up, payment, or refund."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={styles.historyList}>
                            {transactions.map((tx) => (
                                <TransactionRow key={tx.transactionID} tx={tx} onClick={() => setSelectedId(tx.transactionID)} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className={styles.paginationBar}>
                                <button
                                    className={styles.pageBtn}
                                    disabled={filters.page <= 1}
                                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    Previous
                                </button>
                                <span className={styles.pageIndicator}>Page {filters.page} of {totalPages}</span>
                                <button
                                    className={styles.pageBtn}
                                    disabled={filters.page >= totalPages}
                                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <TransactionDetailModal transactionId={selectedId} onClose={() => setSelectedId(null)} />
        </div>
    );
};

export default WalletPage;
