import DashboardLayout, { type MenuGroup } from "@/layouts/DashboardLayout/DashboardLayout";

const TicketIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z" />
    </svg>
);
const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const QrCodeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <line x1="14" y1="14" x2="14" y2="21" /><line x1="21" y1="14" x2="21" y2="21" />
        <line x1="14" y1="14" x2="21" y2="14" /><line x1="14" y1="21" x2="21" y2="21" />
    </svg>
);

const STAFF_MENU: MenuGroup[] = [
    {
        groupKey: "work",
        title: "Work",
        items: [
            {
                key: "checkin",
                label: "Check-in",
                icon: <QrCodeIcon />,
                path: "/staff/checkin",
            },
            {
                key: "bookings",
                label: "Bookings",
                icon: <TicketIcon />,
                path: "/staff/bookings",
                disabled: true,
            },
            {
                key: "schedule",
                label: "Schedule",
                icon: <CalendarIcon />,
                path: "/staff/schedule",
                disabled: true,
            },
        ],
    },
];

export default function StaffLayout() {
    return <DashboardLayout menuGroups={STAFF_MENU} />;
}
