import { type FC } from "react";
import { Drawer, Spin, Button } from "antd";
import dayjs from "dayjs";
import { useActivityLogDetail } from "../hooks/useActivityLogs";
import { ActionTypeBadge, RoleBadge } from "./LogBadge";

interface Props {
    logId: number | null;
    onClose: () => void;
}

const Row: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="alog-drawer__row">
        <span className="alog-drawer__row-label">{label}</span>
        <span className="alog-drawer__row-value">{children}</span>
    </div>
);

/** Read-only detail view — audit logs are never edited from the UI. */
const LogDetailDrawer: FC<Props> = ({ logId, onClose }) => {
    const { data, isLoading, isError, refetch } = useActivityLogDetail(logId);

    return (
        <Drawer
            title="Activity Log Detail"
            open={logId != null}
            onClose={onClose}
            width={420}
            destroyOnHidden
        >
            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                    <Spin size="large" />
                </div>
            ) : isError ? (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                    <p style={{ margin: "0 0 12px", color: "var(--dash-text-1)", fontWeight: 600 }}>
                        Failed to load log detail
                    </p>
                    <Button onClick={() => refetch()}>Retry</Button>
                </div>
            ) : data ? (
                <div className="alog-drawer">
                    <div className="alog-drawer__section">
                        <ActionTypeBadge actionType={data.actionType} />
                        <p className="alog-drawer__desc">{data.description}</p>
                    </div>

                    <div className="alog-drawer__section">
                        <Row label="Log ID">#{data.logId}</Row>
                        <Row label="Timestamp">{dayjs(data.createdAt).format("DD/MM/YYYY HH:mm:ss")}</Row>
                        <Row label="Module">{data.module}</Row>
                        <Row label="IP Address">{data.ipAddress || "—"}</Row>
                    </div>

                    <div className="alog-drawer__section">
                        <p className="alog-drawer__sec-title">Actor</p>
                        <Row label="Name">{data.actorName}</Row>
                        <Row label="Role"><RoleBadge role={data.actorRole} /></Row>
                        <Row label="User ID">#{data.actorId}</Row>
                    </div>

                    {(data.targetUserId != null || data.targetTable) && (
                        <div className="alog-drawer__section">
                            <p className="alog-drawer__sec-title">Target</p>
                            {data.targetUserId != null && <Row label="User ID">#{data.targetUserId}</Row>}
                            {data.targetTable && <Row label="Table">{data.targetTable}</Row>}
                            {data.targetId != null && <Row label="Record ID">#{data.targetId}</Row>}
                        </div>
                    )}
                </div>
            ) : null}
        </Drawer>
    );
};

export default LogDetailDrawer;
