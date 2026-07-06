import { type FC, useMemo, useState } from "react";
import { Button, Input, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useVouchers } from "../hooks/useVouchers";
import type { Voucher, VoucherModalType } from "../types/voucher.types";
import { VOUCHER_PAGE_SIZE } from "../constants/voucher.constants";
import VoucherModal from "../components/VoucherModal";
import DeleteVoucherModal from "../components/DeleteVoucherModal";

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

/* ── Stat pill (mirrors CinemaManagementPage) ── */
const StatPill: FC<{ label: string; value: number; accent?: boolean; muted?: boolean }> = ({
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

const fmtDate = (iso: string) => (iso ? dayjs(iso.slice(0, 10)).format("DD/MM/YYYY") : "—");
const fmtDiscount = (v: Voucher) =>
    v.discountType === "percent" ? `${v.discountValue}%` : `${v.discountValue.toLocaleString("vi-VN")} ₫`;

const VoucherManagementPage: FC = () => {
    const [search, setSearch] = useState("");
    const [applied, setApplied] = useState("");
    const [page, setPage] = useState(1);
    const [modalType, setModalType] = useState<VoucherModalType | null>(null);
    const [selected, setSelected] = useState<Voucher | null>(null);

    const params = useMemo(
        () => ({ pageIndex: page, pageSize: VOUCHER_PAGE_SIZE, searchKeyword: applied || undefined }),
        [page, applied],
    );
    const { data, isLoading, isError, refetch, isFetching } = useVouchers(params);
    const items = data?.items ?? [];
    const total = data?.totalItems ?? items.length;

    // Dedicated unfiltered/unpaginated fetch so the summary pills reflect
    // all promotions, not just whatever fits on the current table page.
    const { data: statsData } = useVouchers({ pageIndex: 1, pageSize: 1000 });
    const stats = useMemo(() => {
        const all = statsData?.items ?? [];
        const now = dayjs();
        return {
            total: statsData?.totalItems ?? all.length,
            active: all.filter((v) => v.isActive).length,
            expired: all.filter((v) => dayjs(v.validUntil.slice(0, 10)).isBefore(now, "day")).length,
        };
    }, [statsData]);

    const openModal = (t: VoucherModalType, voucher?: Voucher) => {
        setSelected(voucher ?? null);
        setModalType(t);
    };
    const closeModal = () => {
        setModalType(null);
        setSelected(null);
    };

    const columns: ColumnsType<Voucher> = [
        {
            title: "Voucher",
            key: "voucher",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {r.imageUrl ? (
                        <img src={r.imageUrl} alt={r.voucherCode} style={{ width: 44, height: 30, borderRadius: 5, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                        <div style={{ width: 44, height: 30, borderRadius: 5, background: "rgba(232,0,28,0.08)", flexShrink: 0 }} />
                    )}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--dash-text-1)", letterSpacing: "0.02em" }}>{r.voucherCode}</span>
                        <span style={{ fontSize: 11, color: "var(--dash-text-3)" }}>{r.category}</span>
                    </div>
                </div>
            ),
        },
        {
            title: "Discount",
            key: "discount",
            width: 120,
            render: (_, r) => (
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-crimson)" }}>{fmtDiscount(r)}</span>
            ),
        },
        {
            title: "Min Order",
            dataIndex: "minOrderValue",
            key: "minOrderValue",
            width: 120,
            align: "right",
            render: (v: number) => <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{v > 0 ? `${v.toLocaleString("vi-VN")} ₫` : "—"}</span>,
            responsive: ["lg"],
        },
        {
            title: "Uses",
            key: "uses",
            width: 90,
            align: "right",
            render: (_, r) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-2)" }}>{r.usedCount}/{r.maxUses}</span>
            ),
            responsive: ["md"],
        },
        {
            title: "Validity",
            key: "validity",
            width: 190,
            render: (_, r) => (
                <span style={{ fontSize: 12.5, color: "var(--dash-text-2)", whiteSpace: "nowrap" }}>
                    {fmtDate(r.validFrom)} – {fmtDate(r.validUntil)}
                </span>
            ),
            responsive: ["lg"],
        },
        {
            title: "Status",
            key: "status",
            width: 100,
            render: (_, r) => (
                <span className={`dash-badge ${r.isActive ? "dash-badge--active" : "dash-badge--inactive"}`}>
                    {r.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: "",
            key: "actions",
            width: 96,
            align: "right",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <Tooltip title="Edit">
                        <button className="dash-icon-btn" aria-label="Edit voucher" onClick={() => openModal("edit", record)}>
                            <EditIcon />
                        </button>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <button className="dash-icon-btn" aria-label="Delete voucher" onClick={() => openModal("delete", record)} style={{ color: "#E8001C" }}>
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
                        <h1 className="dash-page-title">Promotion Management</h1>
                        <p className="dash-page-sub">Create and manage discount vouchers and promotional campaigns.</p>
                    </div>
                    {!isLoading && !isError && stats.total > 0 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <StatPill label="Total" value={stats.total} muted />
                            <StatPill label="Active" value={stats.active} />
                            <StatPill label="Expired" value={stats.expired} accent />
                        </div>
                    )}
                </div>
            </div>

            <div className="dash-toolbar">
                <div className="dash-toolbar__left">
                    <Search
                        placeholder="Search by code..."
                        allowClear
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); if (e.target.value === "") { setApplied(""); setPage(1); } }}
                        onSearch={(v) => { setApplied(v); setPage(1); }}
                        style={{ width: 260 }}
                    />
                </div>
                <div className="dash-toolbar__right">
                    <Tooltip title="Refresh data">
                        <button className="dash-icon-btn" onClick={() => refetch()} aria-label="Refresh" disabled={isFetching}>
                            <RefreshIcon spin={isFetching} />
                        </button>
                    </Tooltip>
                    <Button type="primary" icon={<PlusIcon />} onClick={() => openModal("create")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        Add Promotion
                    </Button>
                </div>
            </div>

            {isError ? (
                <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                    <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>Failed to load promotions</p>
                    <Button onClick={() => refetch()}>Retry</Button>
                </div>
            ) : (
                <div className="dash-card" style={{ overflow: "hidden" }}>
                    <Table<Voucher>
                        dataSource={items}
                        columns={columns}
                        rowKey="voucherId"
                        loading={isLoading || isFetching}
                        onChange={(p) => setPage(p.current ?? 1)}
                        pagination={{
                            current: page,
                            pageSize: VOUCHER_PAGE_SIZE,
                            total,
                            showSizeChanger: false,
                            showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} promotions`,
                            style: { padding: "12px 16px", marginBottom: 0 },
                        }}
                        scroll={{ x: 720 }}
                        rowHoverable
                    />
                </div>
            )}

            <VoucherModal
                mode={modalType === "edit" ? "edit" : "create"}
                voucher={selected}
                open={modalType === "create" || modalType === "edit"}
                onClose={closeModal}
            />
            <DeleteVoucherModal voucher={selected} open={modalType === "delete"} onClose={closeModal} />
        </div>
    );
};

export default VoucherManagementPage;
