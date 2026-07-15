import { type FC, useState } from "react";
import { Select, Pagination, Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
    useNotifications,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
    useDeleteNotification,
    useDeleteReadNotifications,
} from "@/features/notifications/hooks/useNotifications";
import type { NotificationItem, NotificationType } from "@/features/notifications/types/notification.types";
import {
    NOTIFICATION_TYPE_FILTER_OPTIONS,
    READ_STATUS_FILTER_OPTIONS,
    NOTIFICATION_PAGE_SIZE,
} from "@/features/notifications/constants/notification.constants";
import {
    fmtRelativeTime,
    NOTIFICATION_TYPE_COLOR_DARK,
    NOTIFICATION_TYPE_LABEL,
    resolveCustomerNotificationUrl,
} from "@/features/notifications/utils/notification.utils";
import NotificationTypeIcon from "@/features/notifications/components/NotificationTypeIcon";
import styles from "./NotificationsPage.module.css";

const DeleteIcon: FC = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const BellIcon: FC = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);

const SkeletonCard: FC = () => (
    <div className={styles.skeletonCard}>
        <div className={styles.skeletonBlock} style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div className={styles.skeletonBlock} style={{ height: 14, width: "50%" }} />
            <div className={styles.skeletonBlock} style={{ height: 12, width: "80%" }} />
        </div>
    </div>
);

const NotificationCard: FC<{ item: NotificationItem; onOpen: () => void; onDelete: () => void }> = ({ item, onOpen, onDelete }) => {
    const chip = NOTIFICATION_TYPE_COLOR_DARK[item.type];

    return (
        <div
            className={`${styles.card} ${!item.isRead ? styles.cardUnread : ""}`}
            onClick={onOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpen(); }}
        >
            <span className={styles.cardIcon} style={{ background: chip.bg, color: chip.color }}>
                <NotificationTypeIcon type={item.type} size={19} />
            </span>
            <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                    <p className={styles.cardTitle}>{item.title}</p>
                    <div className={styles.cardTopRight}>
                        {!item.isRead && <span className={styles.unreadDot} />}
                        <button
                            className={styles.deleteBtn}
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            aria-label="Delete notification"
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                </div>
                <p className={styles.cardMessage}>{item.message}</p>
                <div className={styles.cardMeta}>
                    <span className={styles.typeChip} style={{ background: chip.bg, color: chip.color }}>
                        {NOTIFICATION_TYPE_LABEL[item.type] ?? item.type}
                    </span>
                    <span className={styles.cardTime}>{fmtRelativeTime(item.createdAt)}</span>
                </div>
            </div>
        </div>
    );
};

const NotificationsPage: FC = () => {
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
        const url = resolveCustomerNotificationUrl(n);
        if (url) navigate(url);
    };

    const clearFilters = () => {
        setIsReadFilter("");
        setTypeFilter("");
        setPage(1);
    };

    const isEmpty = !isLoading && !isError && items.length === 0 && !hasFilters;
    const isFilterEmpty = !isLoading && !isError && items.length === 0 && hasFilters;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Notifications</h1>
                    <p className={styles.subtitle}>
                        Updates about your bookings, payments, refunds, and promotions.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <Button className={styles.actionBtn} loading={markingAll} onClick={() => markAllRead()}>
                        Mark all as read
                    </Button>
                    <Button className={styles.actionBtn} loading={deletingRead} onClick={() => deleteRead()}>
                        Clear read
                    </Button>
                </div>
            </div>

            <div className={styles.toolbar}>
                <Select
                    className={styles.filterSelect}
                    popupClassName={styles.selectPopup}
                    value={isReadFilter}
                    onChange={(v) => { setIsReadFilter(v); setPage(1); }}
                    options={READ_STATUS_FILTER_OPTIONS}
                />
                <Select
                    className={styles.filterSelect}
                    popupClassName={styles.selectPopup}
                    value={typeFilter}
                    onChange={(v) => { setTypeFilter(v); setPage(1); }}
                    options={NOTIFICATION_TYPE_FILTER_OPTIONS}
                />
                {hasFilters && (
                    <Button type="text" className={styles.clearBtn} onClick={clearFilters}>
                        Clear filters
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className={styles.list}>
                    {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : isError ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateText}>Failed to load your notifications.</p>
                    <Button className={styles.actionBtn} onClick={() => refetch()}>Retry</Button>
                </div>
            ) : isEmpty ? (
                <div className={styles.stateBox}>
                    <div style={{ color: "#5a4040", marginBottom: 12 }}><BellIcon /></div>
                    <p className={styles.stateTitle}>You're all caught up</p>
                    <p className={styles.stateText}>New notifications about your bookings and account will show up here.</p>
                </div>
            ) : isFilterEmpty ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>No results found</p>
                    <p className={styles.stateText}>Try adjusting your filters.</p>
                    <Button className={styles.actionBtn} onClick={clearFilters}>Clear filters</Button>
                </div>
            ) : (
                <>
                    <div className={styles.list}>
                        {items.map((n) => (
                            <NotificationCard
                                key={n.notificationId}
                                item={n}
                                onOpen={() => handleOpen(n)}
                                onDelete={() => deleteOne(n.notificationId)}
                            />
                        ))}
                    </div>

                    {total > NOTIFICATION_PAGE_SIZE && (
                        <Pagination
                            className={styles.pagination}
                            current={page}
                            pageSize={NOTIFICATION_PAGE_SIZE}
                            total={total}
                            onChange={setPage}
                            showSizeChanger={false}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default NotificationsPage;
