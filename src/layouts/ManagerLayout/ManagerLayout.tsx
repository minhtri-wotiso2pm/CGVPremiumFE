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
