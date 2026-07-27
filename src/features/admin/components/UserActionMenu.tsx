import { useState, type FC, type JSX } from "react";
import { Popover } from "antd";
import type { AdminUser, UserModalType } from "../types/user.types";

const DotsIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
);
const SpinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
);
const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const ShieldIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const ToggleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
        <circle cx="16" cy="12" r="3" />
    </svg>
);
const LockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
);
// const TrashIcon = () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <polyline points="3 6 5 6 21 6" />
//         <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
//         <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
//     </svg>
// );

interface Props {
    user: AdminUser;
    isProcessing: boolean;
    onAction: (type: UserModalType) => void;
}

const roleClass: Record<string, string> = {
    admin: "dash-role--admin",
    manager: "dash-role--manager",
    staff: "dash-role--staff",
    customer: "dash-role--customer",
};
const statusClass: Record<string, string> = {
    active: "dash-badge--active",
    inactive: "dash-badge--inactive",
    banned: "dash-badge--banned",
};

const actions: { key: UserModalType; label: string; icon: JSX.Element; danger?: boolean }[] = [
    { key: "update", label: "Edit Info", icon: <EditIcon /> },
    { key: "role", label: "Change Role", icon: <ShieldIcon /> },
    { key: "status", label: "Change Status", icon: <ToggleIcon /> },
    { key: "password", label: "Change Password", icon: <LockIcon /> },
];

const UserActionMenu: FC<Props> = ({ user, isProcessing, onAction }) => {
    const [open, setOpen] = useState(false);

    const content = (
        <div style={{ width: 220 }}>
            {/* User preview */}
            <div className="dash-popover-header">
                <p className="dash-popover-name">{user.fullName}</p>
                <p className="dash-popover-email">{user.email}</p>
                <div className="dash-popover-badges">
                    <span className={`dash-role ${roleClass[user.role] ?? "dash-role--customer"}`}>
                        {user.role}
                    </span>
                    <span className={`dash-badge ${statusClass[user.status] ?? "dash-badge--inactive"}`}>
                        {user.status}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="dash-popover-actions">
                {actions.map((action) => (
                    <button
                        key={action.key}
                        className="dash-popover-action"
                        disabled={isProcessing}
                        onClick={() => {
                            setOpen(false);
                            onAction(action.key);
                        }}
                    >
                        {action.icon}
                        {action.label}
                    </button>
                ))}
                <div className="dash-popover-divider" />
                {/* <button
                    className="dash-popover-action dash-popover-action--danger"
                    disabled={isProcessing}
                    onClick={() => {
                        setOpen(false);
                        onAction("delete");
                    }}
                >
                    <TrashIcon />
                    Delete User
                </button> */}
            </div>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            arrow={false}
            overlayStyle={{ padding: 0 }}
            overlayInnerStyle={{ padding: 0, borderRadius: 10, overflow: "hidden" }}
        >
            <button
                className="dash-action-btn"
                disabled={isProcessing}
                aria-label={`Actions for ${user.fullName}`}
            >
                {isProcessing
                    ? <span style={{ animation: "spin 0.8s linear infinite", display: "flex" }}><SpinIcon /></span>
                    : <DotsIcon />
                }
            </button>
        </Popover>
    );
};

export default UserActionMenu;
