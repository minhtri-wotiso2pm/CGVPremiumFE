/* labelKey values are i18n keys (profile namespace) resolved with t() at render. */
export const SIDEBAR_NAV_ITEMS = [
    { key: "profile", labelKey: "profile:nav.profile", path: "/customer/profile", icon: "user" },
    { key: "tickets", labelKey: "profile:nav.tickets", path: "/customer/profile/tickets", icon: "ticket" },
    { key: "membership", labelKey: "profile:nav.membership", path: "/customer/profile/membership", icon: "star" },
    { key: "vouchers", labelKey: "profile:nav.vouchers", path: "/customer/profile/vouchers", icon: "gift" },
    { key: "wallet", labelKey: "profile:nav.wallet", path: "/customer/profile/wallet", icon: "wallet" },
    { key: "notifications", labelKey: "profile:nav.notifications", path: "/customer/profile/notifications", icon: "bell" },
    { key: "settings", labelKey: "profile:nav.settings", path: "/customer/profile/settings", icon: "settings" },
] as const;

export const PROFILE_BREADCRUMB_MAP: Record<string, string> = {
    "/customer/profile": "profile:nav.profile",
    "/customer/profile/tickets": "profile:nav.tickets",
    "/customer/profile/membership": "profile:nav.membership",
    "/customer/profile/vouchers": "profile:nav.vouchers",
    "/customer/profile/wallet": "profile:nav.wallet",
    "/customer/profile/notifications": "profile:nav.notifications",
    "/customer/profile/settings": "profile:nav.settings",
};

export const AVATAR_MAX_SIZE_MB = 5;
export const AVATAR_ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];