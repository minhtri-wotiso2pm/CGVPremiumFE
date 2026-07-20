import { type FC } from "react";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { FnbProduct, FnbModalType } from "../types/fnb-mgmt.types";
import { FnbBagIcon } from "@/components/ui/BrandIcons";
import {
    FNB_STATUS_LABELS, FNB_TYPE_LABELS,
} from "../types/fnb-mgmt.types";

interface Props {
    data: FnbProduct[];
    total: number;
    page: number;
    pageSize: number;
    loading: boolean;
    onPageChange: (page: number, pageSize: number) => void;
    onAction: (product: FnbProduct, type: FnbModalType) => void;
}

/* ── Status badge ── */
const StatusBadge: FC<{ status: string }> = ({ status }) => {
    const label = FNB_STATUS_LABELS[status as keyof typeof FNB_STATUS_LABELS] ?? status;
    const cls = status === "active" ? "dash-badge dash-badge--active" : "dash-badge dash-badge--inactive";
    return <span className={cls}>{label}</span>;
};

/* ── Product thumbnail ── */
const ImageCell: FC<{ url?: string | null; name: string }> = ({ url, name }) => (
    url ? (
        <img
            src={url}
            alt={name}
            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, display: "block" }}
        />
    ) : (
        <div style={{
            width: 40, height: 40, borderRadius: 6,
            background: "var(--dash-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--dash-text-3)",
        }}>
            <FnbBagIcon size={20} />
        </div>
    )
);

/* ── Skeleton ── */
const SkeletonRow = () => (
    <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
        {[48, 52, 200, 110, 110, 90, 80].map((w, i) => (
            <td key={i} style={{ padding: "14px 12px" }}>
                <div className="dash-skeleton" style={{ height: 14, width: w, borderRadius: 4 }} />
            </td>
        ))}
    </tr>
);

const FnbTableSkeleton = () => (
    <div className="dash-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
        </table>
    </div>
);

/* ── Icons ── */
const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
);

/* ── Price formatter ── */
const formatPrice = (v: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

/* ══════════════════
   FnbProductTable
══════════════════ */
const FnbProductTable: FC<Props> = ({
    data, total, page, pageSize, loading, onPageChange, onAction,
}) => {
    if (loading) return <FnbTableSkeleton />;

    const columns: ColumnsType<FnbProduct> = [
        {
            title: "#",
            key: "index",
            width: 48,
            render: (_, __, i) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", fontVariantNumeric: "tabular-nums" }}>
                    {(page - 1) * pageSize + i + 1}
                </span>
            ),
        },
        {
            title: "",
            key: "image",
            width: 56,
            render: (_, r) => <ImageCell url={r.imageURL} name={r.itemName} />,
        },
        {
            title: "Product Name",
            dataIndex: "itemName",
            key: "itemName",
            render: (name: string, r) => (
                <div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>{name}</span>
                    {r.isLoyaltyEligible === true && (
                        <span style={{
                            marginLeft: 6, fontSize: 10, padding: "1px 5px",
                            borderRadius: 8, background: "rgba(234,179,8,0.12)",
                            border: "1px solid rgba(234,179,8,0.3)",
                            color: "#ca8a04", fontWeight: 600,
                        }}>
                            Loyalty
                        </span>
                    )}
                </div>
            ),
        },
        {
            title: "Type",
            dataIndex: "itemType",
            key: "itemType",
            width: 110,
            render: (type: string) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-2)" }}>
                    {FNB_TYPE_LABELS[type as keyof typeof FNB_TYPE_LABELS] ?? type}
                </span>
            ),
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            width: 110,
            render: (p: number) => (
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text-1)", fontVariantNumeric: "tabular-nums" }}>
                    {formatPrice(p)}
                </span>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 110,
            render: (s: string) => <StatusBadge status={s} />,
        },
        {
            title: "",
            key: "actions",
            width: 80,
            align: "center",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                    <Tooltip title="Edit">
                        <button className="dash-icon-btn" onClick={() => onAction(record, "edit")} aria-label="Edit">
                            <EditIcon />
                        </button>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <button className="dash-icon-btn dash-icon-btn--danger" onClick={() => onAction(record, "delete")} aria-label="Delete">
                            <TrashIcon />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className="dash-card" style={{ overflow: "hidden" }}>
            <Table<FnbProduct>
                dataSource={data}
                columns={columns}
                rowKey="itemID"
                onChange={(p) => onPageChange(p.current ?? 1, p.pageSize ?? pageSize)}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} products`,
                    style: { padding: "12px 16px", marginBottom: 0 },
                }}
                scroll={{ x: 720 }}
                rowHoverable
            />
        </div>
    );
};

export default FnbProductTable;
