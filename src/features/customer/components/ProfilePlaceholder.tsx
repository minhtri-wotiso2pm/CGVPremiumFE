import type { FC } from "react";
import styles from "./ProfilePlaceholder.module.css";

interface Props {
    icon: string;
    title: string;
    subtitle: string;
}

const ProfilePlaceholder: FC<Props> = ({ icon, title, subtitle }) => (
    <div className={styles.root}>
        <div className={styles.iconRing}>
            <span className={styles.icon} aria-hidden>{icon}</span>
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
        <div className={styles.badge}>Coming Soon</div>
    </div>
);

export default ProfilePlaceholder;