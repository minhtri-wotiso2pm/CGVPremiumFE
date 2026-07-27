import type { FC } from "react";
import { Outlet } from "react-router-dom";
import ProfileSidebar from "../components/ProfileSidebar";
import ProfileBreadcrumb from "../components/ProfileBreadcrumb";
import styles from "./CustomerProfileLayout.module.css";

/* ── Layout ── */
export const CustomerProfileLayout: FC = () => (
    <div className={styles.page}>
        <div className={styles.layout}>
            <ProfileSidebar />
            <main className={styles.content} id="profile-main">
                <ProfileBreadcrumb />
                <Outlet />
            </main>
        </div>
    </div>
);

/* ── Sub-pages ── */
export { default as TicketsPage } from "./MyTicketsPage";

export { default as MembershipPage } from "./MembershipPage";

export { default as VouchersPage } from "./VouchersPage";

export { default as WalletPage } from "./WalletPage";

export { default as NotificationsPage } from "./NotificationsPage";

export { default as SettingsPage } from "./SettingsPage";
