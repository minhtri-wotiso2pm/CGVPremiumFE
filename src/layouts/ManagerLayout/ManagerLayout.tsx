import DashboardLayout, { type MenuGroup } from "@/layouts/DashboardLayout/DashboardLayout";

const FilmIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
);
const ChartIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const MANAGER_MENU: MenuGroup[] = [
    {
        groupKey: "operations",
        title: "Operations",
        items: [
            {
                key: "movies",
                label: "Movies",
                icon: <FilmIcon />,
                path: "/manager/movies",
                disabled: true,
            },
            {
                key: "reports",
                label: "Reports",
                icon: <ChartIcon />,
                path: "/manager/reports",
                disabled: true,
            },
        ],
    },
];

export default function ManagerLayout() {
    return <DashboardLayout menuGroups={MANAGER_MENU} />;
}
