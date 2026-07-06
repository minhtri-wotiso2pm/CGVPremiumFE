import { type FC } from "react";
import { Table, Button, Empty, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { ActivityLogRow } from "../types/activityLog.types";
import { ActionTypeBadge, RoleBadge } from "./LogBadge";

const EyeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const fmtTimestamp = (iso: string) => (iso ? dayjs(iso).format("DD/MM/YYYY HH:mm:ss") : "—");

const targetLabel = (r: ActivityLogRow): string => {
    const parts: string[] = [];
    if (r.targetUserId != null) parts.push(`User #${r.targetUserId}`);
    if (r.targetTable) parts.push(r.targetTable + (r.targetId != null ? ` #${r.targetId}` : ""));
    return parts.length > 0 ? parts.join(" · ") : "—";
};

interface Props {
    data: ActivityLogRow[];
    loading: boolean;
    isError?: boolean;
    onRetry?: () => void;
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onViewDetail: (logId: number) => void;
}

/** Mobile fallback — see MoviePerformanceTable for the same
 *  table/card-toggle pattern (CSS breakpoint, not JS-side rendering logic). */
const LogCardList: FC<{ data: ActivityLogRow[]; onViewDetail: (logId: number) => void }> = ({ data, onViewDetail }) => (
    <div className="alog-cards">
        {data.map((r) => (
            <div key={r.logId} className="alog-card" onClick={() => onViewDetail(r.logId)}>
                <div className="alog-card__head">
                    <ActionTypeBadge actionType={r.actionType} />
                    <span className="alog-card__time">{fmtTimestamp(r.timestamp)}</span>
                </div>
                <p className="alog-card__desc">{r.description}</p>
                <div className="alog-card__foot">
                    <span className="alog-card__actor">
                        {r.actor.fullName} <RoleBadge role={r.actor.role} />
                    </span>
                    <span className="alog-card__module">{r.module}</span>
                </div>
            </div>
        ))}
    </div>
);

const LogTable: FC<Props> = ({
    data, loading, isError, onRetry,
    page, pageSize, total, onPageChange, onViewDetail,
}) => {
    const columns: ColumnsType<ActivityLogRow> = [
        {
            title: "Timestamp",
            dataIndex: "timestamp",
            key: "timestamp",
            width: 170,
            render: (v: string) => (
                <span style={{ fontSize: 12.5, color: "var(--dash-text-2)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {fmtTimestamp(v)}
                </span>
            ),
        },
        {
            title: "Actor",
            key: "actor",
            width: 200,
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text-1)" }}>{r.actor.fullName}</span>
                    <RoleBadge role={r.actor.role} />
                </div>
            ),
        },
        {
            title: "Action Type",
            dataIndex: "actionType",
            key: "actionType",
            width: 150,
            render: (v: string) => <ActionTypeBadge actionType={v} />,
        },
        {
            title: "Module",
            dataIndex: "module",
            key: "module",
            width: 110,
            render: (v: string) => <span style={{ fontSize: 12.5, color: "var(--dash-text-2)" }}>{v}</span>,
            responsive: ["md"],
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (v: string) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-1)" }}>{v}</span>
            ),
        },
        {
            title: "Target",
            key: "target",
            width: 160,
            render: (_, r) => (
                <span style={{ fontSize: 12.5, color: "var(--dash-text-2)" }}>{targetLabel(r)}</span>
            ),
            responsive: ["lg"],
        },
        {
            title: "IP Address",
            dataIndex: "ipAddress",
            key: "ipAddress",
            width: 130,
            render: (v: string) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", fontVariantNumeric: "tabular-nums" }}>{v || "—"}</span>
            ),
            responsive: ["xl"],
        },
        {
            title: "",
            key: "actions",
            width: 60,
            align: "right",
            render: (_, r) => (
                <Tooltip title="View detail">
                    <button
                        className="dash-icon-btn"
                        aria-label="View log detail"
                        onClick={(e) => { e.stopPropagation(); onViewDetail(r.logId); }}
                    >
                        <EyeIcon />
                    </button>
                </Tooltip>
            ),
        },
    ];

    if (isError) {
        return (
            <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                    Failed to load activity logs
                </p>
                {onRetry && <Button onClick={onRetry}>Retry</Button>}
            </div>
        );
    }

    if (!loading && data.length === 0) {
        return (
            <div className="dash-card" style={{ padding: "48px 24px" }}>
                <Empty description="No activity logs found" />
            </div>
        );
    }

    return (
        <>
            <div className="dash-card alog-table" style={{ overflow: "hidden" }}>
                <Table<ActivityLogRow>
                    dataSource={data}
                    columns={columns}
                    rowKey="logId"
                    loading={loading}
                    sticky
                    onRow={(record) => ({
                        onClick: () => onViewDetail(record.logId),
                        style: { cursor: "pointer" },
                    })}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        showSizeChanger: false,
                        onChange: onPageChange,
                        showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} logs`,
                        style: { padding: "12px 16px", marginBottom: 0 },
                    }}
                    scroll={{ x: 1000 }}
                    rowHoverable
                />
            </div>
            <LogCardList data={data} onViewDetail={onViewDetail} />
        </>
    );
};

export default LogTable;
