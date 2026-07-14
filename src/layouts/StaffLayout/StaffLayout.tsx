import DashboardLayout, {
    type MenuGroup,
} from "@/layouts/DashboardLayout/DashboardLayout";

const TicketIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z" />
    </svg>
);

const STAFF_MENU: MenuGroup[] = [
    {
        groupKey: "work",
        title: "Work",
        items: [
            {
                key: "counter-booking",
                label: "Counter Booking",
                icon: <TicketIcon />,
                path: "/staff/counter-booking",
            },
            {
                key: "counter-payment",
                label: "Counter Payment",
                icon: <TicketIcon />,
                path: "/staff/counter-payment",
            },
            {
                key: "checkin",
                label: "QR Check-in",
                icon: <TicketIcon />,
                path: "/staff/checkin",
            },
        ],
    },
];

export default function StaffLayout() {
    return <DashboardLayout menuGroups={STAFF_MENU} />;
}