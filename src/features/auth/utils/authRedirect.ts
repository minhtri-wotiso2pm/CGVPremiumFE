/** Shape of the `location.state` route guards attach before bouncing an
 *  unauthenticated user to /login, so LoginPage can send them back. */
export interface LoginRedirectState {
    from?: string;
}

/** Captures "where the user was trying to go" for a post-login redirect. */
export const buildLoginRedirectState = (location: { pathname: string; search: string }): LoginRedirectState => ({
    from: `${location.pathname}${location.search}`,
});

/** Route prefixes exclusive to one role (see routes/index.tsx). Anything
 *  not under one of these is the guest/customer area. */
const ROLE_ONLY_PREFIX: Record<string, string> = {
    ADMIN: "/admin",
    MANAGER: "/manager",
    STAFF: "/staff",
};

const isUnderPrefix = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

/** Only ever follow same-origin relative paths (never absolute/protocol
 *  URLs), even though `from` is always set by our own route guards.
 *
 *  Also rejects a `from` that belongs to a different role than the one
 *  actually logging in — e.g. logging out while on /customer/profile sets
 *  `from: "/customer/profile"`; if a MANAGER account logs in next on that
 *  same /login page, blindly honoring `from` would send them into a
 *  customer-only route and bounce them straight to /403. */
export const getSafeRedirect = (path: string | null | undefined, fallback: string, role?: string): string => {
    if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;

    const normalizedRole = role?.toUpperCase();
    const staffAreaPrefixes = Object.values(ROLE_ONLY_PREFIX);
    const isStaffArea = staffAreaPrefixes.some((prefix) => isUnderPrefix(path, prefix));

    if (isStaffArea) {
        const ownPrefix = normalizedRole ? ROLE_ONLY_PREFIX[normalizedRole] : undefined;
        return ownPrefix && isUnderPrefix(path, ownPrefix) ? path : fallback;
    }

    // Everything else (/, /customer/*, /theaters, /promotions, /about, ...)
    // is the guest/customer area — off-limits to staff/manager/admin.
    return normalizedRole === "CUSTOMER" ? path : fallback;
};
