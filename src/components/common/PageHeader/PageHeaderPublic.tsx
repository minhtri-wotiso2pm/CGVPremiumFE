import {
    useState,
    useEffect,
    useRef,
    useCallback,
    type FC,
    type KeyboardEvent,
} from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

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
    label: string;
    path: string;
}

const NAV_CONFIG: Record<string, NavItem[]> = {
    CUSTOMER: [
        { label: "Home", path: "/customer" },
        { label: "Movies", path: "/customer/movies" },
        { label: "Theaters", path: "/customer/theaters" },
        { label: "Promotions", path: "/customer/promotions" },
        { label: "My Tickets", path: "/customer/tickets" },
    ],
    STAFF: [
        { label: "Dashboard", path: "/staff" },
        { label: "Schedule", path: "/staff/schedule" },
        { label: "Reports", path: "/staff/reports" },
    ],
    ADMIN: [
        { label: "Dashboard", path: "/admin" },
        { label: "Users", path: "/admin/users" },
        { label: "Content", path: "/admin/content" },
        { label: "Analytics", path: "/admin/analytics" },
        { label: "Settings", path: "/admin/settings" },
    ],
};

/* ─────────────────────────────────────────────────────────────
   FAKE NOTIFICATION DATA (replace with API later)
───────────────────────────────────────────────────────────── */
interface Notification {
    id: number;
    title: string;
    body: string;
    time: string;
    unread: boolean;
    icon: string;
}

const FAKE_NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        title: "Booking Confirmed",
        body: "Your seats for Dune: Part Two have been booked.",
        time: "2 min ago",
        unread: true,
        icon: "🎬",
    },
    {
        id: 2,
        title: "VIP Reward Earned",
        body: "You earned 120 loyalty points from your last visit.",
        time: "1 hour ago",
        unread: true,
        icon: "⭐",
    },
    {
        id: 3,
        title: "Weekend Offer",
        body: "20% off all premium seats this Saturday & Sunday.",
        time: "3 hours ago",
        unread: true,
        icon: "🎁",
    },
];

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
   SEARCH BOX
───────────────────────────────────────────────────────────── */
const SearchBox: FC = () => {
    const [value, setValue] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && value.trim()) {
            navigate(`/customer/movies?q=${encodeURIComponent(value.trim())}`);
            setValue("");
        }
    };

    return (
        <div style={{
            display: "flex", alignItems: "center",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${H.border}`,
            borderRadius: 8, padding: "0 12px",
            transition: "border-color 0.2s, box-shadow 0.2s",
        }}
            onFocus={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "rgba(232,0,28,0.35)";
                el.style.boxShadow = "0 0 0 3px rgba(232,0,28,0.07)";
            }}
            onBlur={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = H.border;
                el.style.boxShadow = "none";
            }}
        >
            {/* Search icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={H.textMuted} strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="search"
                value={value}
                placeholder="Search movies..."
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleSearch}
                aria-label="Search movies"
                style={{
                    background: "transparent", border: "none", outline: "none",
                    color: H.textPrimary, fontSize: 13, padding: "8px 10px",
                    width: 180, fontFamily: "inherit", caretColor: H.crimson,
                }}
            />
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   NOTIFICATION DROPDOWN
───────────────────────────────────────────────────────────── */
interface NotifDropdownProps {
    notifications: Notification[];
    onClose: () => void;
}

const NotifDropdown: FC<NotifDropdownProps> = ({ notifications, onClose }) => {
    const unreadCount = notifications.filter((n) => n.unread).length;
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    return (
        <div ref={ref} style={{
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
                    Notifications
                </span>
                {unreadCount > 0 && (
                    <span style={{
                        fontSize: 10, fontWeight: 700, color: H.crimson,
                        letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                        {unreadCount} new
                    </span>
                )}
            </div>

            {/* Items */}
            {notifications.map((n) => (
                <div key={n.id} style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${H.border}`,
                    background: n.unread ? H.crimsonSubtle : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    display: "flex", gap: 12, alignItems: "flex-start",
                }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background =
                            n.unread ? "rgba(232,0,28,0.12)" : H.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background =
                            n.unread ? H.crimsonSubtle : "transparent";
                    }}
                >
                    <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.2 }}>{n.icon}</span>
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
                            {n.body}
                        </p>
                        <span style={{ fontSize: 10.5, color: H.textMuted }}>
                            {n.time}
                        </span>
                    </div>
                    {n.unread && (
                        <div style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: H.crimson, flexShrink: 0, marginTop: 4,
                        }} />
                    )}
                </div>
            ))}

            {/* Footer */}
            <div style={{ padding: "10px 16px", textAlign: "center" }}>
                <button style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, color: H.crimson, fontFamily: "inherit",
                    fontWeight: 600, letterSpacing: "0.04em",
                }}>
                    View all notifications
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
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    const menuItems = [
        { label: "Profile", icon: "", path: "/customer/profile" },
        { label: "Settings", icon: "", path: "/customer/settings" },
    ];

    return (
        <div ref={ref} style={{
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
                        key={item.label}
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
                        {item.label}
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
                    Sign Out
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   MOBILE DRAWER
───────────────────────────────────────────────────────────── */
interface DrawerProps {
    isOpen: boolean;
    navItems: NavItem[];
    user: { fullName: string; email: string; avatarURL: string | null };
    onClose: () => void;
    onLogout: () => void;
    activePath: string;
}

const MobileDrawer: FC<DrawerProps> = ({
    isOpen, navItems, user, onClose, onLogout, activePath,
}) => {
    const navigate = useNavigate();

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
                aria-label="Navigation menu"
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
                            CGVPREMIUM
                        </span>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: H.crimson }} />
                    </div>
                    <button onClick={onClose} aria-label="Close menu" style={{
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

                {/* Nav links */}
                <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }} aria-label="Mobile navigation">
                    {navItems.map((item) => {
                        const isActive = activePath === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => { navigate(item.path); onClose(); }}
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
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Drawer footer */}
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
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

/* ─────────────────────────────────────────────────────────────
   PAGE HEADER — main export
───────────────────────────────────────────────────────────── */
const PageHeader: FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

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
    const role = user?.role ?? "CUSTOMER";
    const navItems = NAV_CONFIG[role] ?? NAV_CONFIG["CUSTOMER"];

    /* Scroll listener — shrink header */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Close drawer on route change */
    useEffect(() => setDrawerOpen(false), [location.pathname]);

    /* Logout handler
     * TODO: Before navigate, call API logout endpoint here:
     *   await logoutApi();
     * Then dispatch and navigate.
     */
    const handleLogout = useCallback(() => {
        dispatch(logout());
        navigate("/login");
    }, [dispatch, navigate]);

    const headerHeight = scrolled ? H.heightScrolled : H.heightDefault;
    const logoSize = scrolled ? 18 : 22;

    if (!user) return null;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

                @keyframes cgv-dropdown-in {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cgv-nav-link {
                    background: none; border: none; cursor: pointer;
                    font-family: inherit;
                    font-size: 13px; font-weight: 500;
                    letter-spacing: 0.04em;
                    padding: 6px 12px; border-radius: 6px;
                    transition: background 0.15s, color 0.15s;
                    white-space: nowrap;
                    text-decoration: none;
                    display: inline-flex; align-items: center;
                }
                .cgv-icon-btn {
                    background: none; border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 8px; padding: 7px;
                    transition: background 0.15s, color 0.15s;
                    color: #b09090;
                    position: relative;
                }
                .cgv-icon-btn:hover { background: rgba(255,255,255,0.05); color: #f0e8e8; }
                .cgv-hamburger { display: none; }
                .cgv-search-wrap { display: flex; }
                @media (max-width: 768px) {
                    .cgv-nav-desktop  { display: none !important; }
                    .cgv-search-wrap  { display: none !important; }
                    .cgv-hamburger    { display: flex !important; }
                }
            `}</style>

            {/* Header */}
            <header style={{
                position: "sticky", top: 0, zIndex: 1000,
                background: scrolled ? H.bgScrolled : H.bg,
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.05)" : "transparent"}`,
                boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.4)" : "none",
                transition: "height 0.3s ease, background 0.3s ease, box-shadow 0.3s ease",
                height: headerHeight,
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
            }}>
                <div style={{
                    maxWidth: 1320, margin: "0 auto",
                    padding: "0 24px",
                    height: "100%", display: "flex",
                    alignItems: "center", justifyContent: "space-between", gap: 16,
                }}>
                    {/* ── LEFT: Logo ── */}
                    <Link
                        to="/customer"
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            textDecoration: "none", flexShrink: 0,
                        }}
                    >
                        <span style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: logoSize,
                            fontWeight: 700, letterSpacing: "0.08em",
                            background: "linear-gradient(135deg,#ff1a1a 0%,#cc0000 60%,#990000 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            transition: "font-size 0.3s ease",
                            lineHeight: 1,
                        }}>
                            CGVPREMIUM
                        </span>
                        <span style={{
                            width: scrolled ? 4 : 5, height: scrolled ? 4 : 5,
                            borderRadius: "50%", background: H.crimson, flexShrink: 0,
                            transition: "width 0.3s, height 0.3s",
                            marginBottom: scrolled ? 12 : 16,
                        }} />
                    </Link>

                    {/* ── CENTER: Desktop nav ── */}
                    <nav
                        className="cgv-nav-desktop"
                        aria-label="Main navigation"
                        style={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    className="cgv-nav-link"
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        color: isActive ? H.crimson : H.textNav,
                                        background: isActive ? H.crimsonSubtle : "none",
                                        fontWeight: isActive ? 600 : 500,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget).style.background = "rgba(255,255,255,0.05)";
                                            (e.currentTarget).style.color = H.textPrimary;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget).style.background = "none";
                                            (e.currentTarget).style.color = H.textNav;
                                        }
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* ── RIGHT: actions ── */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        {/* Search — desktop only */}
                        <div className="cgv-search-wrap" style={{ marginRight: 8 }}>
                            <SearchBox />
                        </div>

                        {/* Notification bell */}
                        <div style={{ position: "relative" }}>
                            <button
                                className="cgv-icon-btn"
                                aria-label={`Notifications — ${FAKE_NOTIFICATIONS.filter(n => n.unread).length} unread`}
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
                                {/* Unread badge */}
                                <span style={{
                                    position: "absolute", top: 4, right: 4,
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: H.crimson,
                                    border: "1.5px solid #0a0202",
                                }} aria-hidden="true" />
                            </button>

                            {notifDropOpen && (
                                <NotifDropdown
                                    notifications={FAKE_NOTIFICATIONS}
                                    onClose={() => setNotifDropOpen(false)}
                                />
                            )}
                        </div>

                        {/* Avatar + user dropdown */}
                        <div style={{ position: "relative", marginLeft: 4 }}>
                            <button
                                onClick={() => {
                                    setUserDropOpen((v) => !v);
                                    setNotifDropOpen(false);
                                }}
                                aria-haspopup="true"
                                aria-expanded={userDropOpen}
                                aria-label="User menu"
                                style={{
                                    background: "none", border: "none",
                                    cursor: "pointer", padding: 2,
                                    borderRadius: "50%", display: "flex",
                                    transition: "opacity 0.15s",
                                }}
                                onMouseEnter={(e) => { (e.currentTarget).style.opacity = "0.85"; }}
                                onMouseLeave={(e) => { (e.currentTarget).style.opacity = "1"; }}
                            >
                                <Avatar src={user.avatarURL} name={user.fullName} size={36} />
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

                        {/* Hamburger — mobile only */}
                        <button
                            className="cgv-icon-btn cgv-hamburger"
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Open navigation menu"
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