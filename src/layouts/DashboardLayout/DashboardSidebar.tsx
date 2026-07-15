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

const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

/* Exact same logo as PageHeaderPublic — the whole row doubles as the
 * sidebar's only collapse toggle, click anywhere on it. */
const SidebarLogo = ({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) => (
    <div
        className="dash-sidebar__logo"
        onClick={onToggleCollapse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleCollapse(); } }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
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
            <SidebarLogo collapsed={collapsed} onToggleCollapse={onToggleCollapse} />

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

            {/* Bottom actions — Sign Out always stays last */}
            <div className="dash-sidebar__bottom">
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
            </div>
        </aside>
    );
};

export default DashboardSidebar;
