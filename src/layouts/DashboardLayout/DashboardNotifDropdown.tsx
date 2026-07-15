import { type FC } from "react";
import type { NotificationItem } from "@/features/notifications/types/notification.types";
import { fmtRelativeTime, NOTIFICATION_TYPE_COLOR } from "@/features/notifications/utils/notification.utils";
import NotificationTypeIcon from "@/features/notifications/components/NotificationTypeIcon";

interface Props {
    notifications: NotificationItem[];
    unreadCount: number;
    isLoading: boolean;
    onItemClick: (n: NotificationItem) => void;
    onViewAll: () => void;
}

/** Light "dash-*" themed counterpart to the customer header's NotifDropdown
 *  — same data/behavior, presentation matched to the Manager/Admin/Staff
 *  design system instead of the dark customer-facing one. Outside-click
 *  detection lives in the parent DashboardHeader (its wrapping div covers
 *  both the bell trigger and this panel), not here. */
const DashboardNotifDropdown: FC<Props> = ({ notifications, unreadCount, isLoading, onItemClick, onViewAll }) => {
    return (
        <div className="dash-notif-dropdown">
            <div className="dash-notif-dropdown__header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                    <span className="dash-notif-dropdown__unread">{unreadCount} new</span>
                )}
            </div>

            {isLoading ? (
                <div className="dash-notif-dropdown__empty">Loading…</div>
            ) : notifications.length === 0 ? (
                <div className="dash-notif-dropdown__empty">You're all caught up — no notifications yet.</div>
            ) : (
                notifications.map((n) => (
                    <div
                        key={n.notificationId}
                        className={`dash-notif-dropdown__item${!n.isRead ? " dash-notif-dropdown__item--unread" : ""}`}
                        onClick={() => onItemClick(n)}
                        role="button"
                        tabIndex={0}
                    >
                        <span
                            className="dash-notif-dropdown__icon"
                            style={{
                                background: NOTIFICATION_TYPE_COLOR[n.type].bg,
                                color: NOTIFICATION_TYPE_COLOR[n.type].color,
                            }}
                        >
                            <NotificationTypeIcon type={n.type} size={17} />
                        </span>
                        <div className="dash-notif-dropdown__body">
                            <p className="dash-notif-dropdown__title">{n.title}</p>
                            <p className="dash-notif-dropdown__message">{n.message}</p>
                            <span className="dash-notif-dropdown__time">{fmtRelativeTime(n.createdAt)}</span>
                        </div>
                        {!n.isRead && <span className="dash-notif-dropdown__dot" />}
                    </div>
                ))
            )}

            <div className="dash-notif-dropdown__footer">
                <button onClick={onViewAll}>View all notifications</button>
            </div>
        </div>
    );
};

export default DashboardNotifDropdown;
