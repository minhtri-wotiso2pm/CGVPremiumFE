import DashboardLayout, { type MenuGroup } from "@/layouts/DashboardLayout/DashboardLayout";

/* ── Icons ── */
const DashboardIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
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
        groupKey: "overview",
        title: "Overview",
        items: [
            {
                key: "dashboard",
                label: "Dashboard",
                icon: <DashboardIcon />,
                path: "/manager/dashboard",
            },
        ],
    },
    {
        groupKey: "management",
        title: "Management",
        items: [
            {
                key: "rooms",
                label: "Room Management",
                icon: <RoomIcon />,
                path: "/manager/rooms",
            },
            {
                key: "seat-types",
                label: "Seat Types",
                icon: <SeatIcon />,
                path: "/manager/seat-types",
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
            },
        ],
    },
];

export default function ManagerLayout() {
    return <DashboardLayout menuGroups={MANAGER_MENU} />;
}
