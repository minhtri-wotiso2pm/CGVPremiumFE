import { type FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "@/features/auth/hooks/useLogoutMutation";
import type { MenuGroup } from "./DashboardLayout";

interface Props {
    menuGroups: MenuGroup[];
    collapsed: boolean;
    mobileOpen: boolean;
    onClose: () => void;
    onToggleCollapse: () => void;
}

const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {collapsed
            ? <polyline points="9 18 15 12 9 6" />
            : <polyline points="15 18 9 12 15 6" />
        }
    </svg>
);

const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

/* Exact same logo as PageHeaderPublic */
const SidebarLogo = ({ collapsed }: { collapsed: boolean }) => (
    <div className="dash-sidebar__logo">
        {collapsed ? (
            <span style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
            }}>
                <span style={{
                    width: 7, height: 7,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#ff1a1a 0%,#cc0000 60%,#990000 100%)",
                    flexShrink: 0,
                }} />
            </span>
        ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                <span style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    background: "linear-gradient(135deg,#ff1a1a 0%,#cc0000 60%,#990000 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                }}>
                    CGVPREMIUM
                </span>
                <span style={{
                    width: 5, height: 5,
                    borderRadius: "50%",
                    background: "#E8001C",
                    flexShrink: 0,
                }} />
            </span>
        )}
    </div>
);

const DashboardSidebar: FC<Props> = ({ menuGroups, collapsed, mobileOpen, onClose, onToggleCollapse }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { mutate: logout } = useLogout();

    const sidebarClass = [
        "dash-sidebar",
        collapsed ? "dash-sidebar--collapsed" : "",
        mobileOpen ? "dash-sidebar--mobile-open" : "",
    ].filter(Boolean).join(" ");

    return (
        <aside className={sidebarClass}>
            <SidebarLogo collapsed={collapsed} />

            {/* Navigation */}
            <nav className="dash-sidebar__nav" aria-label="Dashboard navigation">
                {menuGroups.map((group) => (
                    <div key={group.groupKey} className="dash-sidebar__group">
                        {group.title && (
                            <span className="dash-sidebar__group-label">{group.title}</span>
                        )}
                        {group.items.map((item) => {
                            const isActive = location.pathname === item.path ||
                                location.pathname.startsWith(item.path + "/");
                            return (
                                <button
                                    key={item.key}
                                    className={[
                                        "dash-sidebar__item",
                                        isActive ? "dash-sidebar__item--active" : "",
                                    ].filter(Boolean).join(" ")}
                                    onClick={() => {
                                        if (!item.disabled) {
                                            navigate(item.path);
                                            onClose();
                                        }
                                    }}
                                    disabled={item.disabled}
                                    title={collapsed ? item.label : undefined}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <span className="dash-sidebar__item-icon">{item.icon}</span>
                                    {!collapsed && (
                                        <span className="dash-sidebar__item-label">{item.label}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Bottom actions */}
            <div className="dash-sidebar__bottom">
                {/* Logout */}
                <button
                    className="dash-sidebar__logout"
                    onClick={() => logout()}
                    title={collapsed ? "Sign Out" : undefined}
                    aria-label="Sign Out"
                >
                    <span className="dash-sidebar__item-icon">
                        <LogoutIcon />
                    </span>
                    {!collapsed && (
                        <span className="dash-sidebar__item-label">Sign Out</span>
                    )}
                </button>

                {/* Collapse toggle */}
                <button
                    className="dash-sidebar__collapse"
                    onClick={onToggleCollapse}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <CollapseIcon collapsed={collapsed} />
                    {!collapsed && (
                        <span style={{ fontSize: 12, fontFamily: "inherit" }}>Collapse</span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
