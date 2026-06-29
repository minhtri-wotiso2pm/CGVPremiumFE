import dayjs from "dayjs";
export const formatMemberSince = (iso: string) => dayjs(iso).format("DD MMMM YYYY");
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
export const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
export const mapRole = (role: string): string =>
    ({ customer: "Customer", staff: "Staff", admin: "Admin", manager: "Manager" }[role.toLowerCase()] ?? capitalize(role));
export const mapStatusColor = (status: string): string =>
    ({ active: "success", inactive: "error", pending: "warning" }[status.toLowerCase()] ?? "default");
export const buildInitialsAvatar = (name: string): string => {
    const i = getInitials(name);
    return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%23b50016'/><text x='50' y='63' text-anchor='middle' font-size='38' font-weight='700' font-family='Inter,sans-serif' fill='%23ffffff'>${i}</text></svg>`;
};