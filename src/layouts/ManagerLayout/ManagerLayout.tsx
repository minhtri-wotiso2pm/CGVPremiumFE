import DashboardLayout, { type MenuGroup } from "@/layouts/DashboardLayout/DashboardLayout";

/* ── Icons ── */
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
const RoomIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
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
const ShowtimeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="12" cy="16" r="2" />
        <path d="M12 14v-2M12 18v-0.01" strokeWidth="2" />
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

const MANAGER_MENU: MenuGroup[] = [
    {
        groupKey: "management",
        title: "Management",
        items: [
            {
                key: "cinemas",
                label: "Cinema Management",
                icon: <CinemaIcon />,
                path: "/manager/cinemas",
            },
            {
                key: "rooms",
                label: "Room Management",
                icon: <RoomIcon />,
                path: "/manager/rooms",
                disabled: true,
            },
            {
                key: "seats",
                label: "Seat Management",
                icon: <SeatIcon />,
                path: "/manager/seats",
                disabled: true,
            },
        ],
    },
    {
        groupKey: "operations",
        title: "Operations",
        items: [
            {
                key: "showtimes",
                label: "Showtime Management",
                icon: <ShowtimeIcon />,
                path: "/manager/showtimes",
                disabled: true,
            },
            {
                key: "movies",
                label: "Movie Management",
                icon: <MovieIcon />,
                path: "/manager/movies",
                disabled: true,
            },
            {
                key: "promotions",
                label: "Promotion Management",
                icon: <PromotionIcon />,
                path: "/manager/promotions",
                disabled: true,
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
                path: "/manager/reports",
                disabled: true,
            },
        ],
    },
];

export default function ManagerLayout() {
    return <DashboardLayout menuGroups={MANAGER_MENU} />;
}
