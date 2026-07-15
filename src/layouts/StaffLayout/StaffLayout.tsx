import DashboardLayout, { type MenuGroup } from "@/layouts/DashboardLayout/DashboardLayout";

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
        ],
    },
];

export default function StaffLayout() {
    return <DashboardLayout menuGroups={STAFF_MENU} />;
}
