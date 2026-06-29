import DashboardLayout, { type MenuGroup } from "@/layouts/DashboardLayout/DashboardLayout";

const UsersIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
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
                key: "activity",
                label: "Activity Log",
                icon: <ActivityIcon />,
                path: "/admin/activity",
                disabled: true,
            },
        ],
    },
];

export default function AdminLayout() {
    return <DashboardLayout menuGroups={ADMIN_MENU} />;
}
