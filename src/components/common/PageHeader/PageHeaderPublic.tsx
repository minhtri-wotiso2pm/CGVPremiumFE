import {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
    type FC,
    type CSSProperties,
} from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { useLanguage } from "@/hooks/useLanguage";

import { useLogout } from "@/features/auth/hooks/useLogoutMutation";
import { buildLoginRedirectState } from "@/features/auth/utils/authRedirect";
import { SPLASH_TOTAL_MS } from "@/components/common/SplashScreen/SplashScreen";
import { useIntroEntrance } from "@/components/common/SplashScreen/useIntroEntrance";
import {
    useNotifications,
    useUnreadCount,
    useMarkNotificationRead,
} from "@/features/notifications/hooks/useNotifications";
import type { NotificationItem } from "@/features/notifications/types/notification.types";
import {
    fmtRelativeTime,
    NOTIFICATION_TYPE_COLOR_DARK,
    resolveCustomerNotificationUrl,
} from "@/features/notifications/utils/notification.utils";
import NotificationTypeIcon from "@/features/notifications/components/NotificationTypeIcon";
import { NOTIFICATION_DROPDOWN_PREVIEW_COUNT } from "@/features/notifications/constants/notification.constants";
import "./PageHeaderPublic.css";

/** Guest clicked a nav item that requires auth (e.g. My Tickets) — send
 *  them to /login but remember where they actually wanted to go, so
 *  LoginPage/PublicRoute can bounce them back there after signing in. */
const goToNavItem = (
    navigate: ReturnType<typeof useNavigate>,
    item: { path: string; requireAuth?: boolean },
    isAuthed: boolean,
) => {
    if (item.requireAuth && !isAuthed) {
        navigate("/login", { state: buildLoginRedirectState({ pathname: item.path, search: "" }) });
    } else {
        navigate(item.path);
    }
};

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS (Dark Mode — extend for Light Mode later)
───────────────────────────────────────────────────────────── */
const H = {
    // Surfaces
    bg: "rgba(8, 2, 2, 0.92)",
    bgScrolled: "rgba(6, 1, 1, 0.97)",
    surface: "rgba(18, 6, 6, 0.98)",
    surfaceHover: "rgba(30, 8, 8, 0.95)",
    drawerBg: "#0a0202",
    // Brand
    crimson: "#E8001C",
    crimsonDim: "#b50016",
    crimsonGlow: "rgba(232,0,28,0.18)",
    crimsonSubtle: "rgba(232,0,28,0.08)",
    // Text
    textPrimary: "#f0e8e8",
    textSecondary: "#b09090",
    textMuted: "#6b4a4a",
    textNav: "#c8a8a8",
    // Borders
    border: "rgba(255,255,255,0.06)",
    borderHover: "rgba(232,0,28,0.25)",
    // Height tokens
    heightDefault: 72,
    heightScrolled: 54,
} as const;

/* ─────────────────────────────────────────────────────────────
   ROLE-BASED NAV CONFIG
   Extend this map to add STAFF / ADMIN menus without touching JSX
───────────────────────────────────────────────────────────── */
interface NavItem {
    labelKey: string;
    path: string;
    requireAuth?: boolean;
}

const NAV_CONFIG: Record<string, NavItem[]> = {
    GUEST: [
        { labelKey: "header:nav.home", path: "/" },
        { labelKey: "header:nav.theaters", path: "/theaters" },
        { labelKey: "header:nav.promotions", path: "/promotions" },
        { labelKey: "header:nav.about", path: "/about" },
        { labelKey: "header:nav.myTickets", path: "/customer/profile/tickets", requireAuth: true },
    ],
    CUSTOMER: [
        { labelKey: "header:nav.home", path: "/customer" },
        { labelKey: "header:nav.theaters", path: "/customer/theaters" },
        { labelKey: "header:nav.promotions", path: "/customer/promotions" },
        { labelKey: "header:nav.about", path: "/customer/about" },
        { labelKey: "header:nav.myTickets", path: "/customer/profile/tickets" },
    ],
    STAFF: [
        { labelKey: "header:nav.dashboard", path: "/staff" },
        { labelKey: "header:nav.schedule", path: "/staff/schedule" },
        { labelKey: "header:nav.reports", path: "/staff/reports" },
    ],
    ADMIN: [
        { labelKey: "header:nav.dashboard", path: "/admin" },
        { labelKey: "header:nav.users", path: "/admin/users" },
        { labelKey: "header:nav.content", path: "/admin/content" },
        { labelKey: "header:nav.analytics", path: "/admin/analytics" },
        { labelKey: "header:nav.settings", path: "/admin/settings" },
    ],
};

/* ─────────────────────────────────────────────────────────────
   AVATAR COMPONENT
───────────────────────────────────────────────────────────── */
interface AvatarProps {
    src: string | null;
    name: string;
    size: number;
}

const Avatar: FC<AvatarProps> = ({ src, name, size }) => {
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                style={{
                    width: size, height: size, borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${H.crimson}`,
                    flexShrink: 0,
                }}
            />
        );
    }

    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: `linear-gradient(135deg, ${H.crimson} 0%, ${H.crimsonDim} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.38, fontWeight: 700,
            color: "#fff", flexShrink: 0,
            letterSpacing: "0.04em",
            border: `2px solid rgba(232,0,28,0.4)`,
            userSelect: "none",
        }}>
            {initials}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   NOTIFICATION DROPDOWN
───────────────────────────────────────────────────────────── */
interface NotifDropdownProps {
    notifications: NotificationItem[];
    unreadCount: number;
    isLoading: boolean;
    onClose: () => void;
    onItemClick: (n: NotificationItem) => void;
    onViewAll: () => void;
}

const NotifDropdown: FC<NotifDropdownProps> = ({ notifications, unreadCount, isLoading, onItemClick, onViewAll }) => {
    const { t } = useTranslation("header");
    return (
        <div style={{
            position: "absolute", top: "calc(100% + 10px)", right: 0,
            width: 340, background: H.surface,
            border: `1px solid ${H.border}`,
            borderRadius: 12, overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4)",
            zIndex: 1100,
            animation: "cgv-dropdown-in 0.18s cubic-bezier(0.22,1,0.36,1)",
        }}>
            {/* Header */}
            <div style={{
                padding: "14px 16px", borderBottom: `1px solid ${H.border}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: H.textPrimary, letterSpacing: "0.02em" }}>
                    {t("notif.title")}
                </span>
                {unreadCount > 0 && (
                    <span style={{
                        fontSize: 10, fontWeight: 700, color: H.crimson,
                        letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                        {t("notif.newCount", { count: unreadCount })}
                    </span>
                )}
            </div>

            {/* Items */}
            {isLoading ? (
                <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 12, color: H.textMuted }}>
                    {t("notif.loading")}
                </div>
            ) : notifications.length === 0 ? (
                <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 12.5, color: H.textMuted }}>
                    {t("notif.empty")}
                </div>
            ) : (
                notifications.map((n) => {
                    const chip = NOTIFICATION_TYPE_COLOR_DARK[n.type] ?? NOTIFICATION_TYPE_COLOR_DARK.system;
                    return (
                    <div key={n.notificationId} style={{
                        padding: "12px 16px",
                        borderBottom: `1px solid ${H.border}`,
                        background: !n.isRead ? H.crimsonSubtle : "transparent",
                        cursor: "pointer",
                        transition: "background 0.15s",
                        display: "flex", gap: 12, alignItems: "flex-start",
                    }}
                        onClick={() => onItemClick(n)}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLDivElement).style.background =
                                !n.isRead ? "rgba(232,0,28,0.12)" : H.surfaceHover;
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.background =
                                !n.isRead ? H.crimsonSubtle : "transparent";
                        }}
                    >
                        <span style={{
                            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: chip.bg,
                            color: chip.color,
                        }}>
                            <NotificationTypeIcon type={n.type} size={17} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                fontSize: 12.5, fontWeight: 600,
                                color: H.textPrimary, margin: "0 0 3px",
                                letterSpacing: "0.01em",
                            }}>
                                {n.title}
                            </p>
                            <p style={{
                                fontSize: 11.5, color: H.textSecondary,
                                margin: "0 0 4px", lineHeight: 1.5,
                                overflow: "hidden", textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}>
                                {n.message}
                            </p>
                            <span style={{ fontSize: 10.5, color: H.textMuted }}>
                                {fmtRelativeTime(n.createdAt)}
                            </span>
                        </div>
                        {!n.isRead && (
                            <div style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: H.crimson, flexShrink: 0, marginTop: 4,
                            }} />
                        )}
                    </div>
                    );
                })
            )}

            {/* Footer */}
            <div style={{ padding: "10px 16px", textAlign: "center" }}>
                <button
                    onClick={onViewAll}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 12, color: H.crimson, fontFamily: "inherit",
                        fontWeight: 600, letterSpacing: "0.04em",
                    }}
                >
                    {t("notif.viewAll")}
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   USER DROPDOWN
───────────────────────────────────────────────────────────── */
interface UserDropdownProps {
    name: string;
    email: string;
    avatar: string | null;
    onClose: () => void;
    onLogout: () => void;
}

const UserDropdown: FC<UserDropdownProps> = ({ name, email, avatar, onClose, onLogout }) => {
    const navigate = useNavigate();
    const { t } = useTranslation("header");

    const menuItems = [
        { labelKey: "userMenu.profile", icon: "", path: "/customer/profile" },
        { labelKey: "userMenu.myTickets", icon: "", path: "/customer/profile/tickets" },
        { labelKey: "userMenu.settings", icon: "", path: "/customer/profile/settings" },
    ];

    return (
        <div style={{
            position: "absolute", top: "calc(100% + 10px)", right: 0,
            width: 240, background: H.surface,
            border: `1px solid ${H.border}`,
            borderRadius: 12, overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4)",
            zIndex: 1100,
            animation: "cgv-dropdown-in 0.18s cubic-bezier(0.22,1,0.36,1)",
        }}>
            {/* User info block */}
            <div style={{
                padding: "16px",
                borderBottom: `1px solid ${H.border}`,
                display: "flex", alignItems: "center", gap: 12,
            }}>
                <Avatar src={avatar} name={name} size={38} />
                <div style={{ minWidth: 0 }}>
                    <p style={{
                        fontSize: 13, fontWeight: 600, color: H.textPrimary,
                        margin: 0, letterSpacing: "0.01em",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                        {name}
                    </p>
                    <p style={{
                        fontSize: 11, color: H.textMuted, margin: "2px 0 0",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                        {email}
                    </p>
                </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: "6px 0" }}>
                {menuItems.map((item) => (
                    <button
                        key={item.labelKey}
                        onClick={() => { navigate(item.path); onClose(); }}
                        style={{
                            width: "100%", background: "none", border: "none",
                            padding: "10px 16px", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 10,
                            color: H.textSecondary, fontSize: 13,
                            fontFamily: "inherit", textAlign: "left",
                            transition: "background 0.15s, color 0.15s",
                            letterSpacing: "0.01em",
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = H.surfaceHover;
                            el.style.color = H.textPrimary;
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "none";
                            el.style.color = H.textSecondary;
                        }}
                    >
                        <span style={{ fontSize: 15 }}>{item.icon}</span>
                        {t(item.labelKey)}
                    </button>
                ))}
            </div>

            {/* Divider + Logout */}
            <div style={{ borderTop: `1px solid ${H.border}`, padding: "6px 0" }}>
                <button
                    onClick={onLogout}
                    style={{
                        width: "100%", background: "none", border: "none",
                        padding: "10px 16px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 10,
                        color: H.crimson, fontSize: 13,
                        fontFamily: "inherit", textAlign: "left",
                        transition: "background 0.15s",
                        letterSpacing: "0.01em", fontWeight: 600,
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget).style.background = H.crimsonSubtle;
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget).style.background = "none";
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        strokeLinejoin="round" aria-hidden="true"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {t("userMenu.signOut")}
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   LANGUAGE TOGGLE — compact EN | VI switch, visible to guests too
───────────────────────────────────────────────────────────── */
const LangToggle: FC<{ style?: CSSProperties }> = ({ style }) => {
    const { t } = useTranslation("header");
    const { language, setLanguage } = useLanguage();

    const btn = (lang: "en" | "vi", label: string) => {
        const active = language === lang;
        return (
            <button
                onClick={() => setLanguage(lang)}
                aria-pressed={active}
                aria-label={lang === "en" ? "English" : "Tiếng Việt"}
                style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "4px 5px", fontFamily: "inherit",
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                    color: active ? H.textPrimary : H.textMuted,
                    borderBottom: active ? `2px solid ${H.crimson}` : "2px solid transparent",
                    transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                    if (!active) (e.currentTarget).style.color = H.textSecondary;
                }}
                onMouseLeave={(e) => {
                    if (!active) (e.currentTarget).style.color = H.textMuted;
                }}
            >
                {label}
            </button>
        );
    };

    return (
        <div
            role="group"
            aria-label={t("language")}
            style={{ display: "flex", alignItems: "center", ...style }}
        >
            {btn("en", "EN")}
            <span aria-hidden="true" style={{ color: H.textMuted, fontSize: 11, opacity: 0.5 }}>|</span>
            {btn("vi", "VI")}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   MOBILE DRAWER
───────────────────────────────────────────────────────────── */
interface DrawerProps {
    isOpen: boolean;
    navItems: NavItem[];
    user: { fullName: string; email: string; avatarURL: string | null } | null;
    onClose: () => void;
    onLogout?: () => void;
    activePath: string;
}

const MobileDrawer: FC<DrawerProps> = ({
    isOpen, navItems, user, onClose, onLogout, activePath,
}) => {
    const navigate = useNavigate();
    const { t } = useTranslation("header");

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                aria-hidden="true"
                style={{
                    position: "fixed", inset: 0, zIndex: 1199,
                    background: "rgba(0,0,0,0.7)",
                    backdropFilter: "blur(3px)",
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? "all" : "none",
                    transition: "opacity 0.3s",
                }}
            />

            {/* Drawer panel */}
            <div style={{
                position: "fixed", top: 0, left: 0, bottom: 0,
                width: 290, zIndex: 1200,
                background: H.drawerBg,
                borderRight: `1px solid ${H.border}`,
                transform: isOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.32s cubic-bezier(0.22,1,0.36,1)",
                display: "flex", flexDirection: "column",
                boxShadow: isOpen ? "8px 0 40px rgba(0,0,0,0.8)" : "none",
            }}
                role="dialog"
                aria-modal="true"
                aria-label={t("aria.navMenu")}
            >
                {/* Drawer header */}
                <div style={{
                    padding: "20px 20px 18px",
                    borderBottom: `1px solid ${H.border}`,
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 18, fontWeight: 700, letterSpacing: "0.08em",
                            background: "linear-gradient(135deg,#ff1a1a,#cc0000)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}>
                            CVPREMIUM
                        </span>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: H.crimson }} />
                    </div>
                    <button onClick={onClose} aria-label={t("aria.closeMenu")} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: H.textMuted, padding: 4,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* User block */}
                {user ? (
                    <div style={{
                        padding: "20px",
                        borderBottom: `1px solid ${H.border}`,
                        display: "flex", alignItems: "center", gap: 12,
                    }}>
                        <Avatar src={user.avatarURL} name={user.fullName} size={44} />
                        <div style={{ minWidth: 0 }}>
                            <p style={{
                                fontSize: 14, fontWeight: 600, color: H.textPrimary,
                                margin: 0, letterSpacing: "0.01em",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                                {user.fullName}
                            </p>
                            <p style={{
                                fontSize: 11, color: H.textMuted, margin: "3px 0 0",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                                {user.email}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        padding: "20px",
                        borderBottom: `1px solid ${H.border}`,
                    }}>
                        <p style={{ fontSize: 12, color: H.textMuted, margin: "0 0 12px", letterSpacing: "0.02em" }}>
                            {t("signInPrompt")}
                        </p>
                        <button
                            onClick={() => { navigate("/login"); onClose(); }}
                            style={{
                                width: "100%", padding: "10px 0",
                                background: `linear-gradient(135deg, ${H.crimson}, ${H.crimsonDim})`,
                                border: "none", borderRadius: 8, cursor: "pointer",
                                fontSize: 13, fontWeight: 700, color: "#fff",
                                fontFamily: "inherit", letterSpacing: "0.08em",
                                textTransform: "uppercase",
                            }}
                        >
                            {t("login")}
                        </button>
                    </div>
                )}

                {/* Nav links */}
                <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }} aria-label={t("aria.mobileNav")}>
                    {navItems.map((item) => {
                        const isActive = user ? activePath === item.path : false;
                        return (
                            <button
                                key={item.path}
                                onClick={() => { goToNavItem(navigate, item, !!user); onClose(); }}
                                style={{
                                    width: "100%", background: isActive ? H.crimsonSubtle : "none",
                                    border: "none", borderLeft: isActive ? `3px solid ${H.crimson}` : "3px solid transparent",
                                    padding: "13px 20px", cursor: "pointer",
                                    display: "flex", alignItems: "center",
                                    color: isActive ? H.crimson : H.textSecondary,
                                    fontSize: 14, fontFamily: "inherit",
                                    fontWeight: isActive ? 600 : 400,
                                    textAlign: "left", letterSpacing: "0.02em",
                                    transition: "background 0.15s, color 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        const el = e.currentTarget;
                                        el.style.background = H.surfaceHover;
                                        el.style.color = H.textPrimary;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        const el = e.currentTarget;
                                        el.style.background = "none";
                                        el.style.color = H.textSecondary;
                                    }
                                }}
                            >
                                {t(item.labelKey)}
                            </button>
                        );
                    })}
                </nav>

                {/* Language row */}
                <div style={{
                    padding: "12px 20px",
                    borderTop: `1px solid ${H.border}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                        textTransform: "uppercase", color: H.textMuted,
                    }}>
                        {t("language")}
                    </span>
                    <LangToggle />
                </div>

                {/* Drawer footer */}
                {user && onLogout && (
                    <div style={{ padding: "16px 0", borderTop: `1px solid ${H.border}` }}>
                        <button
                            onClick={onLogout}
                            style={{
                                width: "100%", background: "none", border: "none",
                                padding: "12px 20px", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 10,
                                color: H.crimson, fontSize: 13,
                                fontFamily: "inherit", fontWeight: 600,
                                letterSpacing: "0.02em",
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round" aria-hidden="true"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            {t("userMenu.signOut")}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

/* ─────────────────────────────────────────────────────────────
   PAGE HEADER — main export
───────────────────────────────────────────────────────────── */
const PageHeader: FC = () => {
    const { mutate: logout } = useLogout();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation("header");

    /* Redux state — no extra API call, use existing auth slice */
    const user = useAppSelector((state) => state.auth.user);

    /* Scroll shrink */
    const [scrolled, setScrolled] = useState(false);

    /* Dropdowns */
    const [userDropOpen, setUserDropOpen] = useState(false);
    const [notifDropOpen, setNotifDropOpen] = useState(false);

    /* Mobile drawer */
    const [drawerOpen, setDrawerOpen] = useState(false);

    /* Resolve nav items by role */
    const role = user ? user.role.toUpperCase() : "GUEST";
    const navItems = NAV_CONFIG[role] ?? NAV_CONFIG["GUEST"];

    /* Notifications — only fetched for logged-in users (guests never see the bell) */
    const { data: unreadData } = useUnreadCount(!!user);
    const { data: notifData, isLoading: notifLoading } = useNotifications(
        { page: 1, pageSize: NOTIFICATION_DROPDOWN_PREVIEW_COUNT },
        !!user,
    );
    const { mutate: markRead } = useMarkNotificationRead();
    const unreadCount = unreadData?.count ?? 0;
    const notifItems = notifData?.items ?? [];

    const handleNotifItemClick = (n: NotificationItem) => {
        if (!n.isRead) markRead(n.notificationId);
        setNotifDropOpen(false);
        const url = resolveCustomerNotificationUrl(n);
        if (url) navigate(url);
    };
    const handleViewAllNotifications = () => {
        setNotifDropOpen(false);
        navigate("/customer/profile/notifications");
    };

    /* Outside-click closes whichever dropdown is open. The ref wraps BOTH
     * the trigger button and its panel as siblings, so re-clicking an
     * already-open trigger registers as "inside" and doesn't fight with
     * the button's own onClick toggle (see notifWrapRef/userWrapRef below). */
    const notifWrapRef = useRef<HTMLDivElement>(null);
    const userWrapRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!notifDropOpen && !userDropOpen) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (notifDropOpen && notifWrapRef.current && !notifWrapRef.current.contains(target)) {
                setNotifDropOpen(false);
            }
            if (userDropOpen && userWrapRef.current && !userWrapRef.current.contains(target)) {
                setUserDropOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [notifDropOpen, userDropOpen]);

    /* Scroll listener — shrink header */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Close drawer on route change — adjust state during render (react.dev pattern) */
    const [prevPath, setPrevPath] = useState(location.pathname);
    if (prevPath !== location.pathname) {
        setPrevPath(location.pathname);
        setDrawerOpen(false);
    }

    /* Logout handler
     * TODO: Before navigate, call API logout endpoint here:
     *   await logoutApi();
     * Then dispatch and navigate.
     */
    const handleLogout = useCallback(() => {
        logout();
    }, [logout]);

    const logoHref = user ? "/customer" : "/";

    /* Splash-synced entrance — plays once per full page load */
    const playIntro = useIntroEntrance();

    /* Sliding underline: follows hovered link, falls back to active route */
    const [hoverPath, setHoverPath] = useState<string | null>(null);
    const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [underline, setUnderline] = useState({ x: 0, width: 0, visible: false });

    const activePath = navItems.find((i) => i.path === location.pathname)?.path ?? null;
    const targetPath = hoverPath ?? activePath;

    useLayoutEffect(() => {
        const el = targetPath ? itemRefs.current[targetPath] : null;
        const measure = () => {
            if (el) {
                setUnderline({
                    x: el.offsetLeft + el.offsetWidth * 0.2,
                    width: el.offsetWidth * 0.6,
                    visible: true,
                });
            } else {
                setUnderline((u) => ({ ...u, visible: false }));
            }
        };
        measure();
        window.addEventListener("resize", measure);
        // Re-measure continuously while the target button's own box animates
        // (e.g. padding/font-size shrinking on scroll) — a single measurement
        // at the moment of the class toggle only sees the pre-transition size.
        let ro: ResizeObserver | undefined;
        if (el) {
            ro = new ResizeObserver(measure);
            ro.observe(el);
        }
        return () => {
            window.removeEventListener("resize", measure);
            ro?.disconnect();
        };
    }, [targetPath, navItems]);

    return (
        <>
            {/* Header */}
            <header
                className={[
                    "cgv-fh",
                    scrolled ? "cgv-fh--scrolled" : "",
                    playIntro ? "cgv-fh--intro" : "",
                ].filter(Boolean).join(" ")}
                style={playIntro ? { animationDelay: `${SPLASH_TOTAL_MS + 60}ms` } : undefined}
            >
                <div className="cgv-fh__inner">
                    {/* ── LEFT: Logo ── */}
                    <Link to={logoHref} className="cgv-fh__logo" aria-label="CV Premium — home">
                        <span className="cgv-fh__logo-text">CVPREMIUM</span>
                        <span className="cgv-fh__logo-dot" aria-hidden="true" />
                    </Link>

                    {/* ── CENTER: Desktop nav — sliding underline ── */}
                    <nav
                        className="cgv-fh__nav cgv-nav-desktop"
                        aria-label={t("aria.mainNav")}
                    >
                        {navItems.map((item) => {
                            const isActive = item.path === activePath;
                            return (
                                <button
                                    key={item.path}
                                    ref={(el) => { itemRefs.current[item.path] = el; }}
                                    className={`cgv-fh__navlink${isActive ? " cgv-fh__navlink--active" : ""}`}
                                    onClick={() => goToNavItem(navigate, item, !!user)}
                                    onMouseEnter={() => setHoverPath(item.path)}
                                    onMouseLeave={() => setHoverPath(null)}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    {t(item.labelKey)}
                                </button>
                            );
                        })}
                        <span
                            className="cgv-fh__underline"
                            aria-hidden="true"
                            style={{
                                transform: `translateX(${underline.x}px)`,
                                width: underline.width,
                                left: 0,
                                opacity: underline.visible ? 1 : 0,
                            }}
                        />
                    </nav>

                    {/* ── RIGHT: actions ── */}
                    <div className="cgv-fh__actions">

                        {/* Language toggle — always visible, guests included */}
                        <LangToggle style={{ marginRight: 4 }} />

                        {user ? (
                            <>
                                {/* Notification bell */}
                                <div ref={notifWrapRef} style={{ position: "relative" }}>
                                    <button
                                        className="cgv-icon-btn"
                                        aria-label={t("notif.bellAria", { count: unreadCount })}
                                        aria-haspopup="true"
                                        aria-expanded={notifDropOpen}
                                        onClick={() => {
                                            setNotifDropOpen((v) => !v);
                                            setUserDropOpen(false);
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                            strokeLinejoin="round" aria-hidden="true"
                                        >
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                        </svg>
                                        {unreadCount > 0 && (
                                            <span style={{
                                                position: "absolute", top: 4, right: 4,
                                                width: 8, height: 8, borderRadius: "50%",
                                                background: H.crimson,
                                                border: "1.5px solid #0a0202",
                                            }} aria-hidden="true" />
                                        )}
                                    </button>
                                    {notifDropOpen && (
                                        <NotifDropdown
                                            notifications={notifItems}
                                            unreadCount={unreadCount}
                                            isLoading={notifLoading}
                                            onClose={() => setNotifDropOpen(false)}
                                            onItemClick={handleNotifItemClick}
                                            onViewAll={handleViewAllNotifications}
                                        />
                                    )}
                                </div>

                                {/* Avatar + user dropdown */}
                                <div ref={userWrapRef} style={{ position: "relative", marginLeft: 4 }}>
                                    <button
                                        onClick={() => {
                                            setUserDropOpen((v) => !v);
                                            setNotifDropOpen(false);
                                        }}
                                        aria-haspopup="true"
                                        aria-expanded={userDropOpen}
                                        aria-label={t("aria.userMenu")}
                                        className="cgv-fh__avatar-btn"
                                    >
                                        <span style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: H.textPrimary,
                                            maxWidth: 110,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            fontFamily: "inherit",
                                        }}>
                                            {user.fullName}
                                        </span>
                                        <Avatar src={user.avatarURL} name={user.fullName} size={32} />
                                    </button>
                                    {userDropOpen && (
                                        <UserDropdown
                                            name={user.fullName}
                                            email={user.email}
                                            avatar={user.avatarURL}
                                            onClose={() => setUserDropOpen(false)}
                                            onLogout={handleLogout}
                                        />
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Guest: Login button */
                            <button
                                onClick={() => navigate("/login")}
                                className="cgv-fh__login"
                            >
                                {t("login")}
                            </button>
                        )}

                        {/* Hamburger — mobile only */}
                        <button
                            className="cgv-icon-btn cgv-hamburger"
                            onClick={() => setDrawerOpen(true)}
                            aria-label={t("aria.openMenu")}
                            aria-haspopup="dialog"
                            style={{ marginLeft: 4 }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"
                            >
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            <MobileDrawer
                isOpen={drawerOpen}
                navItems={navItems}
                user={user}
                onClose={() => setDrawerOpen(false)}
                onLogout={handleLogout}
                activePath={location.pathname}
            />
        </>
    );
};

export default PageHeader;