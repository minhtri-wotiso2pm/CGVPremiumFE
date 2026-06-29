import { type FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, type MenuProps } from "antd";
import { useAppSelector } from "@/store/hooks";
import { useLogout } from "@/features/auth/hooks/useLogoutMutation";

interface Props {
    onMenuToggle: () => void;
}

const MenuIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);
const BellIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);
const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);
const LogOutIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const DashboardHeader: FC<Props> = ({ onMenuToggle }) => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const { mutate: logout } = useLogout();

    const initials = (user?.fullName ?? "A")
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const handleLogout = useCallback(() => logout(), [logout]);

    const dropdownItems: MenuProps["items"] = [
        {
            key: "profile",
            label: "My Profile",
            icon: <UserIcon />,
            onClick: () => navigate("/admin/profile"),
        },
        { type: "divider" },
        {
            key: "logout",
            label: "Sign Out",
            icon: <LogOutIcon />,
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <header className="dash-header">
            {/* Mobile menu toggle */}
            <button
                className="dash-icon-btn dash-mobile-toggle"
                onClick={onMenuToggle}
                aria-label="Toggle menu"
            >
                <MenuIcon />
            </button>

            <div style={{ flex: 1 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Notification bell */}
                <button className="dash-icon-btn" aria-label="Notifications">
                    <BellIcon />
                </button>

                {/* User dropdown — tên/role bên trái, avatar bên phải */}
                <Dropdown
                    menu={{ items: dropdownItems }}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <button className="dash-header__user-btn" aria-label="User menu">
                        <div style={{ minWidth: 0, textAlign: "right" }}>
                            <div className="dash-header__user-name">
                                {user?.fullName ?? "Admin"}
                            </div>
                            <div className="dash-header__user-role">
                                {user?.role ?? ""}
                            </div>
                        </div>
                        {user?.avatarURL ? (
                            <img
                                src={user.avatarURL}
                                alt={user.fullName}
                                className="dash-avatar"
                            />
                        ) : (
                            <div className="dash-avatar-fallback">{initials}</div>
                        )}
                    </button>
                </Dropdown>
            </div>
        </header>
    );
};

export default DashboardHeader;
