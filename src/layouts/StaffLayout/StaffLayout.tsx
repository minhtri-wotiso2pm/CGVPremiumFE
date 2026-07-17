import DashboardLayout, { type MenuGroup } from "@/layouts/DashboardLayout/DashboardLayout";

/* ── Apple-style line icons (SF Symbols vibe): 24-grid, 1.75 stroke,
   rounded caps/joins, minimal geometry. Hand-drawn, no icon library. ── */

const TicketIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" />
        <path d="M14 6.5v11" strokeDasharray="1.5 2.5" />
    </svg>
);

const QrCodeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" /><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5" />
        <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5" />
        <path d="M14 14h3M20.5 14v3M14 20.5h.01M17.5 17.5h.01M20.5 20.5h.01M17.5 20.5h.01M20.5 17.5h.01" />
    </svg>
);

const BagIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8h12l-.8 10.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L6 8Z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
);

const STAFF_MENU: MenuGroup[] = [
    {
        groupKey: "work",
        title: "Work",
        items: [
            {
                key: "counter",
                label: "Counter Sales",
                icon: <TicketIcon />,
                path: "/staff/counter",
            },
            {
                key: "checkin",
                label: "Check-in",
                icon: <QrCodeIcon />,
                path: "/staff/checkin",
            },
            {
                key: "fnb-pickup",
                label: "F&B Pickup",
                icon: <BagIcon />,
                path: "/staff/fnb-pickup",
            },
        ],
    },
];

export default function StaffLayout() {
    return <DashboardLayout menuGroups={STAFF_MENU} />;
}
