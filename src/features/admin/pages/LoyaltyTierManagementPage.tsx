import { type FC, useMemo, useState } from "react";
import { Button, Input, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLoyaltyTiers } from "../hooks/useLoyaltyTiers";
import type { LoyaltyTierItem, LoyaltyTierModalType } from "../types/loyaltyTier.types";
import LoyaltyTierModal from "../components/LoyaltyTierModal";
import DeleteLoyaltyTierModal from "../components/DeleteLoyaltyTierModal";

const { Search } = Input;

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const EditIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
    </svg>
);
const RefreshIcon = ({ spin }: { spin: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.5s", transform: spin ? "rotate(360deg)" : "rotate(0deg)" }}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
);

/* ── Stat pill (mirrors RoomTypeManagementPage / SeatTypeManagementPage) ── */
const StatPill: FC<{ label: string; value: string | number; accent?: boolean; muted?: boolean }> = ({
    label, value, accent, muted,
}) => (
    <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 14px", borderRadius: 20,
        background: accent ? "rgba(232,0,28,0.06)" : muted ? "rgba(0,0,0,0.03)" : "rgba(34,197,94,0.06)",
        border: `1px solid ${accent ? "rgba(232,0,28,0.14)" : muted ? "var(--dash-border)" : "rgba(34,197,94,0.18)"}`,
    }}>
        <span style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: accent ? "#E8001C" : muted ? "var(--dash-text-3)" : "#22c55e",
        }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text-1)", fontVariantNumeric: "tabular-nums" }}>
            {value}
        </span>
        <span style={{ fontSize: 12, color: "var(--dash-text-2)" }}>{label}</span>
    </div>
);

const LoyaltyTierManagementPage: FC = () => {
    const { data: tiers = [], isLoading, isError, refetch, isFetching } = useLoyaltyTiers();

    const [search, setSearch] = useState("");
    const [modalType, setModalType] = useState<LoyaltyTierModalType | null>(null);
    const [selected, setSelected] = useState<LoyaltyTierItem | null>(null);

    const stats = useMemo(() => {
        if (tiers.length === 0) return { total: 0, topTier: "—", topDiscount: "—" };
        const top = [...tiers].sort((a, b) => b.minPoints - a.minPoints)[0];
        return {
            total: tiers.length,
            topTier: top.tierName,
            topDiscount: `${Math.round(top.discountRate * 100)}%`,
        };
    }, [tiers]);

    const sorted = useMemo(
        () => [...tiers].sort((a, b) => a.minPoints - b.minPoints),
        [tiers],
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return sorted;
        return sorted.filter((t) => t.tierName.toLowerCase().includes(q));
    }, [sorted, search]);

    const openModal = (type: LoyaltyTierModalType, tier?: LoyaltyTierItem) => {
        setSelected(tier ?? null);
        setModalType(type);
    };
    const closeModal = () => {
        setModalType(null);
        setSelected(null);
    };

    const columns: ColumnsType<LoyaltyTierItem> = [
        {
            title: "#",
            key: "index",
            width: 52,
            render: (_, __, i) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
            ),
        },
        {
            title: "Tier Name",
            dataIndex: "tierName",
            key: "tierName",
            render: (name: string) => (
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)", textTransform: "capitalize" }}>{name}</span>
            ),
        },
        {
            title: "Minimum Points",
            dataIndex: "minPoints",
            key: "minPoints",
            width: 150,
            render: (p: number) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-2)", fontVariantNumeric: "tabular-nums" }}>
                    {p.toLocaleString("en-US")}
                </span>
            ),
        },
        {
            title: "Discount Rate",
            dataIndex: "discountRate",
            key: "discountRate",
            width: 130,
            render: (r: number) => (
                <span style={{ fontSize: 13, fontWeight: 600, color: r > 0 ? "var(--dash-crimson)" : "var(--dash-text-2)" }}>
                    {Math.round(r * 100)}%
                </span>
            ),
        },
        {
            title: "Max Refunds / Month",
            dataIndex: "maxRefundPerMonth",
            key: "maxRefundPerMonth",
            width: 170,
            render: (n: number) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{n}</span>
            ),
            responsive: ["md"],
        },
        {
            title: "",
            key: "actions",
            width: 96,
            align: "right",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <Tooltip title="Edit">
                        <button className="dash-icon-btn" aria-label="Edit loyalty tier" onClick={() => openModal("edit", record)}>
                            <EditIcon />
                        </button>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <button className="dash-icon-btn" aria-label="Delete loyalty tier" onClick={() => openModal("delete", record)} style={{ color: "#E8001C" }}>
                            <TrashIcon />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 className="dash-page-title">Loyalty Tiers</h1>
                        <p className="dash-page-sub">Define membership tiers, their point thresholds, discount rates, and monthly refund limits.</p>
                    </div>
                    {!isLoading && !isError && tiers.length > 0 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <StatPill label="Total Tiers" value={stats.total} muted />
                            <StatPill label={`Top Tier — ${stats.topTier}`} value={stats.topDiscount} accent />
                        </div>
                    )}
                </div>
            </div>

            {isError ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "64px 24px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--dash-text-1)" }}>Failed to load loyalty tiers</p>
                    <Button onClick={() => refetch()}>Retry</Button>
                </div>
            ) : (
                <>
                    <div className="dash-toolbar">
                        <div className="dash-toolbar__left">
                            <Search placeholder="Search by tier name..." allowClear value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 240 }} />
                        </div>
                        <div className="dash-toolbar__right">
                            <Tooltip title="Refresh data">
                                <button className="dash-icon-btn" onClick={() => refetch()} aria-label="Refresh" disabled={isFetching}>
                                    <RefreshIcon spin={isFetching} />
                                </button>
                            </Tooltip>
                            <Button type="primary" icon={<PlusIcon />} onClick={() => openModal("create")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                Add Loyalty Tier
                            </Button>
                        </div>
                    </div>

                    <div className="dash-card" style={{ overflow: "hidden" }}>
                        <Table<LoyaltyTierItem>
                            dataSource={filtered}
                            columns={columns}
                            rowKey="tierID"
                            loading={isLoading}
                            pagination={{
                                pageSize: 10,
                                hideOnSinglePage: true,
                                showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} tiers`,
                                style: { padding: "12px 16px", marginBottom: 0 },
                            }}
                            scroll={{ x: 640 }}
                            rowHoverable
                        />
                    </div>
                </>
            )}

            <LoyaltyTierModal
                mode={modalType === "edit" ? "edit" : "create"}
                tier={selected}
                open={modalType === "create" || modalType === "edit"}
                onClose={closeModal}
            />
            <DeleteLoyaltyTierModal
                tier={selected}
                open={modalType === "delete"}
                onClose={closeModal}
            />
        </div>
    );
};

export default LoyaltyTierManagementPage;
