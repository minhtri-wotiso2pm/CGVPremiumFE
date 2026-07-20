import DashboardLayout, { type MenuGroup } from "@/layouts/DashboardLayout/DashboardLayout";

/* ── Icons ── */
const RoomIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
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
const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const ShowtimeTypeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 7h8M8 12h8M8 17h4" />
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
                key: "reports",
                label: "Report",
                icon: <ReportsIcon />,
                path: "/manager/reports",
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
            {
                key: "showtime-types",
                label: "Showtime Types",
                icon: <ShowtimeTypeIcon />,
                path: "/manager/showtime-types",
            },
            {
                key: "showtime-calendar",
                label: "Showtime Calendar",
                icon: <CalendarIcon />,
                path: "/manager/showtime-calendar",
            },
        ],
    },
];

export default function ManagerLayout() {
    return <DashboardLayout menuGroups={MANAGER_MENU} />;
}
