import { type FC, useState } from "react";
import { Button, Select, Table, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import {
    useNotifications,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
    useDeleteNotification,
    useDeleteReadNotifications,
} from "../hooks/useNotifications";
import type { NotificationItem, NotificationType } from "../types/notification.types";
import {
    NOTIFICATION_TYPE_FILTER_OPTIONS,
    READ_STATUS_FILTER_OPTIONS,
    NOTIFICATION_PAGE_SIZE,
} from "../constants/notification.constants";
import { fmtRelativeTime, NOTIFICATION_TYPE_LABEL, NOTIFICATION_TYPE_COLOR } from "../utils/notification.utils";
import NotificationTypeIcon from "../components/NotificationTypeIcon";

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
    </svg>
);

/** Shared across Manager/Admin/Staff — each *Layout.tsx registers this same
 *  page under its own route (/manager/notifications, /admin/notifications,
 *  /staff/notifications); the API is user-scoped via JWT, so no role
 *  branching is needed here. */
const DashboardNotificationsPage: FC = () => {
    const navigate = useNavigate();
    const [isReadFilter, setIsReadFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [page, setPage] = useState(1);

    const params = {
        page,
        pageSize: NOTIFICATION_PAGE_SIZE,
        isRead: isReadFilter === "" ? undefined : isReadFilter === "read",
        type: (typeFilter || undefined) as NotificationType | undefined,
    };

    const { data, isLoading, isError, refetch } = useNotifications(params);
    const { mutate: markRead } = useMarkNotificationRead();
    const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead();
    const { mutate: deleteOne } = useDeleteNotification();
    const { mutate: deleteRead, isPending: deletingRead } = useDeleteReadNotifications();

    const items = data?.items ?? [];
    const total = data?.totalItems ?? items.length;
    const hasFilters = isReadFilter !== "" || typeFilter !== "";

    const handleOpen = (n: NotificationItem) => {
        if (!n.isRead) markRead(n.notificationId);
        if (n.actionUrl) navigate(n.actionUrl);
    };

    const clearFilters = () => {
        setIsReadFilter("");
        setTypeFilter("");
        setPage(1);
    };

    const columns: ColumnsType<NotificationItem> = [
        {
            title: "",
            key: "icon",
            width: 44,
            render: (_, r) => {
                const c = NOTIFICATION_TYPE_COLOR[r.type] ?? NOTIFICATION_TYPE_COLOR.system;
                return (
                    <span style={{
                        width: 32, height: 32, borderRadius: 9,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: c.bg, color: c.color,
                    }}>
                        <NotificationTypeIcon type={r.type} size={16} />
                    </span>
                );
            },
        },
        {
            title: "Notification",
            key: "content",
            render: (_, r) => (
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-text-1)" }}>{r.title}</span>
                        {!r.isRead && (
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--dash-crimson)", flexShrink: 0 }} />
                        )}
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--dash-text-2)" }}>{r.message}</p>
                </div>
            ),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 110,
            render: (t: NotificationType) => {
                const c = NOTIFICATION_TYPE_COLOR[t] ?? NOTIFICATION_TYPE_COLOR.system;
                return (
                    <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 100,
                        background: c.bg, color: c.color, textTransform: "capitalize",
                    }}>
                        {NOTIFICATION_TYPE_LABEL[t] ?? t}
                    </span>
                );
            },
            responsive: ["md"],
        },
        {
            title: "Received",
            key: "createdAt",
            width: 130,
            render: (_, r) => (
                <span style={{ fontSize: 12, color: "var(--dash-text-3)", whiteSpace: "nowrap" }}>
                    {fmtRelativeTime(r.createdAt)}
                </span>
            ),
        },
        {
            title: "",
            key: "actions",
            width: 50,
            align: "right",
            render: (_, r) => (
                <button
                    className="dash-icon-btn"
                    aria-label="Delete notification"
                    onClick={(e) => { e.stopPropagation(); deleteOne(r.notificationId); }}
                >
                    <TrashIcon />
                </button>
            ),
        },
    ];

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="dash-page-title">Notifications</h1>
                    <p className="dash-page-sub">Updates about bookings, payments, refunds, and system events.</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <Button loading={markingAll} onClick={() => markAllRead()}>Mark all as read</Button>
                    <Button loading={deletingRead} onClick={() => deleteRead()}>Clear read</Button>
                </div>
            </div>

            <div className="dash-toolbar">
                <div className="dash-toolbar__left">
                    <Select
                        value={isReadFilter}
                        onChange={(v) => { setIsReadFilter(v); setPage(1); }}
                        options={READ_STATUS_FILTER_OPTIONS}
                        style={{ width: 140 }}
                    />
                    <Select
                        value={typeFilter}
                        onChange={(v) => { setTypeFilter(v); setPage(1); }}
                        options={NOTIFICATION_TYPE_FILTER_OPTIONS}
                        style={{ width: 160 }}
                    />
                </div>
                {hasFilters && (
                    <div className="dash-toolbar__right">
                        <Button onClick={clearFilters}>Clear Filters</Button>
                    </div>
                )}
            </div>

            {isError ? (
                <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                    <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                        Failed to load notifications
                    </p>
                    <Button onClick={() => refetch()}>Retry</Button>
                </div>
            ) : !isLoading && items.length === 0 ? (
                <div className="dash-card" style={{ padding: "48px 24px" }}>
                    <Empty description={hasFilters ? "No results found" : "No notifications yet"} />
                </div>
            ) : (
                <div className="dash-card" style={{ overflow: "hidden" }}>
                    <Table<NotificationItem>
                        dataSource={items}
                        columns={columns}
                        rowKey="notificationId"
                        loading={isLoading}
                        onRow={(record) => ({ onClick: () => handleOpen(record), style: { cursor: "pointer" } })}
                        pagination={{
                            current: page,
                            pageSize: NOTIFICATION_PAGE_SIZE,
                            total,
                            showSizeChanger: false,
                            onChange: setPage,
                            showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} notifications`,
                            style: { padding: "12px 16px", marginBottom: 0 },
                        }}
                        rowHoverable
                    />
                </div>
            )}
        </div>
    );
};

export default DashboardNotificationsPage;
