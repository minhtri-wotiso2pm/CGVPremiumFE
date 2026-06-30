import { type FC } from "react";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Cinema, CinemaModalType } from "../types/cinema.types";
import CinemaActionMenu from "./CinemaActionMenu";

interface Props {
    data: Cinema[];
    total: number;
    page: number;
    pageSize: number;
    loading: boolean;
    processingId: number | null;
    onPageChange: (page: number, pageSize: number) => void;
    onAction: (cinema: Cinema, type: CinemaModalType) => void;
}

const SkeletonRow = () => (
    <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
        {[52, 200, 260, 100, 100, 100, 52].map((w, i) => (
            <td key={i} style={{ padding: "16px 12px" }}>
                <div className="dash-skeleton" style={{ height: 14, width: w, borderRadius: 4 }} />
            </td>
        ))}
    </tr>
);

const CinemaTableSkeleton = () => (
    <div className="dash-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
                    {["#", "Cinema", "Address", "Status", "Created", "Updated", ""].map((h) => (
                        <th key={h} style={{
                            padding: "12px 12px", fontSize: 12, fontWeight: 600,
                            color: "var(--dash-text-2)", textAlign: "left",
                            background: "var(--dash-bg)", letterSpacing: "0.03em",
                        }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
        </table>
    </div>
);

const formatDate = (date: string) =>
    date
        ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

const CinemaTable: FC<Props> = ({
    data, total, page, pageSize, loading, processingId,
    onPageChange, onAction,
}) => {
    if (loading) return <CinemaTableSkeleton />;

    const columns: ColumnsType<Cinema> = [
        {
            title: "#",
            key: "index",
            width: 52,
            render: (_, __, i) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", fontVariantNumeric: "tabular-nums" }}>
                    {(page - 1) * pageSize + i + 1}
                </span>
            ),
        },
        {
            title: "Cinema",
            dataIndex: "cinemaName",
            key: "cinemaName",
            render: (name: string) => (
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>
                    {name}
                </span>
            ),
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
            render: (address: string) => (
                <Tooltip title={address} placement="topLeft">
                    <span style={{
                        fontSize: 13, color: "var(--dash-text-2)",
                        maxWidth: 240, display: "block",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        cursor: "default",
                    }}>
                        {address || "—"}
                    </span>
                </Tooltip>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 110,
            render: (status: string) => (
                <span className={`dash-badge ${status === "ACTIVE" ? "dash-badge--active" : "dash-badge--inactive"}`}>
                    {status === "ACTIVE" ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            render: (d: string) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", whiteSpace: "nowrap" }}>
                    {formatDate(d)}
                </span>
            ),
            responsive: ["lg"],
        },
        {
            title: "Updated",
            dataIndex: "updatedAt",
            key: "updatedAt",
            width: 120,
            render: (d: string) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", whiteSpace: "nowrap" }}>
                    {formatDate(d)}
                </span>
            ),
            responsive: ["xl"],
        },
        {
            title: "",
            key: "actions",
            width: 52,
            align: "center",
            render: (_, record) => (
                <CinemaActionMenu
                    cinema={record}
                    isProcessing={processingId === record.cinemaId}
                    onAction={(type) => onAction(record, type)}
                />
            ),
        },
    ];

    return (
        <div className="dash-card" style={{ overflow: "hidden" }}>
            <Table<Cinema>
                dataSource={data}
                columns={columns}
                rowKey="cinemaId"
                onChange={(p) => onPageChange(p.current ?? 1, p.pageSize ?? pageSize)}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} cinemas`,
                    style: { padding: "12px 16px", marginBottom: 0 },
                }}
                scroll={{ x: 640 }}
                rowHoverable
            />
        </div>
    );
};

export default CinemaTable;
