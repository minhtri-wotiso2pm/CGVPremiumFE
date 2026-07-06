import DashboardLayout, { type MenuGroup } from "@/layouts/DashboardLayout/DashboardLayout";

/* ── Icons ── */
const UsersIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const CinemaIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="13" height="18" rx="1" />
        <path d="M14 8h4l3 4v9h-7V8z" />
        <line x1="5" y1="7" x2="5" y2="7.01" strokeWidth="2.5" />
        <line x1="9" y1="7" x2="9" y2="7.01" strokeWidth="2.5" />
        <line x1="5" y1="12" x2="5" y2="12.01" strokeWidth="2.5" />
        <line x1="9" y1="12" x2="9" y2="12.01" strokeWidth="2.5" />
    </svg>
);
const MovieIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
);
const FnbIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
    </svg>
);
const SeatIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 3h16a1 1 0 011 1v7a4 4 0 01-4 4H7a4 4 0 01-4-4V4a1 1 0 011-1z" />
        <path d="M4 15v4a1 1 0 001 1h14a1 1 0 001-1v-4" />
        <line x1="8" y1="20" x2="8" y2="23" />
        <line x1="16" y1="20" x2="16" y2="23" />
    </svg>
);
const PromotionIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
    </svg>
);
const ReportsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
);
const ActivityIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const ADMIN_MENU: MenuGroup[] = [
    {
        groupKey: "management",
        title: "Management",
        items: [
            {
                key: "users",
                label: "User Management",
                icon: <UsersIcon />,
                path: "/admin/users",
            },
            {
                key: "cinemas",
                label: "Cinema Management",
                icon: <CinemaIcon />,
                path: "/admin/cinemas",
            },
            {
                key: "movies",
                label: "Movie Management",
                icon: <MovieIcon />,
                path: "/admin/movies",
            },
            {
                key: "products",
                label: "F&B Management",
                icon: <FnbIcon />,
                path: "/admin/products",
            },
            {
                key: "seat-types",
                label: "Seat Types",
                icon: <SeatIcon />,
                path: "/admin/seat-types",
            },
            {
                key: "promotions",
                label: "Promotion Management",
                icon: <PromotionIcon />,
                path: "/admin/promotions",
            },
        ],
    },
    {
        groupKey: "analytics",
        title: "Analytics",
        items: [
            {
                key: "reports",
                label: "Reports",
                icon: <ReportsIcon />,
                path: "/admin/reports",
            },
            {
                key: "activity",
                label: "Activity Log",
                icon: <ActivityIcon />,
                path: "/admin/activity-logs",
            },
        ],
    },
];

export default function AdminLayout() {
    return <DashboardLayout menuGroups={ADMIN_MENU} />;
}
