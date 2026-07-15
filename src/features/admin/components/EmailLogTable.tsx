import { type FC } from "react";
import { Table, Button, Empty, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { EmailLogRow } from "../types/emailLog.types";
import { DeliveryStatusBadge } from "./EmailLogBadge";

const fmtTimestamp = (iso: string | null) => (iso ? dayjs(iso).format("DD/MM/YYYY HH:mm:ss") : "—");

/** Masks all but the first 2 characters of the local part — recipient
 *  emails are visible to Admin for support, but no need to show them in
 *  full plaintext in a list that might be glanced at over someone's
 *  shoulder (per the module spec's "may mask part of the email" note). */
const maskEmail = (email: string): string => {
    const [local, domain] = email.split("@");
    if (!domain) return email;
    const visible = local.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;
};

interface Props {
    data: EmailLogRow[];
    loading: boolean;
    isError?: boolean;
    onRetry?: () => void;
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
}

const EmailLogTable: FC<Props> = ({ data, loading, isError, onRetry, page, pageSize, total, onPageChange }) => {
    const columns: ColumnsType<EmailLogRow> = [
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 160,
            render: (v: string) => (
                <span style={{ fontSize: 12.5, color: "var(--dash-text-2)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {fmtTimestamp(v)}
                </span>
            ),
        },
        {
            title: "Recipient",
            dataIndex: "recipientEmail",
            key: "recipientEmail",
            width: 200,
            render: (v: string) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-1)" }}>{maskEmail(v)}</span>
            ),
        },
        {
            title: "Subject",
            dataIndex: "subject",
            key: "subject",
            render: (v: string) => (
                <span style={{ fontSize: 13, color: "var(--dash-text-1)" }}>{v}</span>
            ),
        },
        {
            title: "Event Type",
            dataIndex: "eventType",
            key: "eventType",
            width: 170,
            render: (v: string) => (
                <span style={{ fontSize: 12.5, color: "var(--dash-text-2)" }}>{v}</span>
            ),
            responsive: ["md"],
        },
        {
            title: "Status",
            dataIndex: "deliveryStatus",
            key: "deliveryStatus",
            width: 110,
            render: (v: EmailLogRow["deliveryStatus"]) => <DeliveryStatusBadge status={v} />,
        },
        {
            title: "Retries",
            dataIndex: "retryCount",
            key: "retryCount",
            width: 80,
            align: "center",
            render: (v: number, r) => (
                <span style={{
                    fontSize: 12.5, fontVariantNumeric: "tabular-nums",
                    color: r.deliveryStatus === "failed" && v > 0 ? "var(--dash-crimson)" : "var(--dash-text-2)",
                    fontWeight: v > 0 ? 600 : 400,
                }}>
                    {v}
                </span>
            ),
            responsive: ["lg"],
        },
        {
            title: "Error",
            dataIndex: "errorMessage",
            key: "errorMessage",
            width: 60,
            align: "center",
            render: (v: string | null) =>
                v ? (
                    <Tooltip title={v}>
                        <span style={{ color: "var(--dash-crimson)", fontSize: 16, cursor: "help" }}>⚠</span>
                    </Tooltip>
                ) : (
                    <span style={{ color: "var(--dash-text-3)" }}>—</span>
                ),
            responsive: ["xl"],
        },
        {
            title: "Sent At",
            dataIndex: "sentAt",
            key: "sentAt",
            width: 160,
            render: (v: string | null) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {fmtTimestamp(v)}
                </span>
            ),
            responsive: ["lg"],
        },
    ];

    if (isError) {
        return (
            <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                    Failed to load email logs
                </p>
                {onRetry && <Button onClick={onRetry}>Retry</Button>}
            </div>
        );
    }

    if (!loading && data.length === 0) {
        return (
            <div className="dash-card" style={{ padding: "48px 24px" }}>
                <Empty description="No email logs found" />
            </div>
        );
    }

    return (
        <div className="dash-card" style={{ overflow: "hidden" }}>
            <Table<EmailLogRow>
                dataSource={data}
                columns={columns}
                rowKey="emailLogId"
                loading={loading}
                sticky
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
    );
};

export default EmailLogTable;
