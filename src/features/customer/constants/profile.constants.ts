export const SIDEBAR_NAV_ITEMS = [
    { key: "profile", label: "Profile", path: "/customer/profile", icon: "user" },
    { key: "tickets", label: "My Tickets", path: "/customer/profile/tickets", icon: "ticket" },
    { key: "membership", label: "Membership", path: "/customer/profile/membership", icon: "star" },
    { key: "vouchers", label: "Vouchers", path: "/customer/profile/vouchers", icon: "gift" },
    { key: "wallet", label: "EGift Wallet", path: "/customer/profile/wallet", icon: "wallet" },
    { key: "notifications", label: "Notifications", path: "/customer/profile/notifications", icon: "bell" },
    { key: "settings", label: "Settings", path: "/customer/profile/settings", icon: "settings" },
] as const;

export const PROFILE_BREADCRUMB_MAP: Record<string, string> = {
    "/customer/profile": "Profile",
    "/customer/profile/tickets": "My Tickets",
    "/customer/profile/membership": "Membership",
    "/customer/profile/vouchers": "Vouchers",
    "/customer/profile/wallet": "EGift Wallet",
    "/customer/profile/notifications": "Notifications",
    "/customer/profile/settings": "Settings",
};

export const AVATAR_MAX_SIZE_MB = 5;
export const AVATAR_ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];