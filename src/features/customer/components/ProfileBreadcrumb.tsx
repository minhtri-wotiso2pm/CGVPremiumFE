import type { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { HomeOutlined, UserOutlined, RightOutlined } from "@ant-design/icons";
import { PROFILE_BREADCRUMB_MAP } from "../constants/profile.constants";
import styles from "./Profilebreadcrumb.module.css";

const ProfileBreadcrumb: FC = () => {
    const { pathname } = useLocation();
    const leafLabel = PROFILE_BREADCRUMB_MAP[pathname] ?? "Profile";

    return (
        <nav aria-label="Breadcrumb" className={styles.root}>
            <ol className={styles.list}>
                <li className={styles.item}>
                    <Link to="/customer" className={styles.link} aria-label="Home">
                        <HomeOutlined className={styles.icon} />
                        Home
                    </Link>
                </li>

                <li className={styles.sep} aria-hidden>
                    <RightOutlined />
                </li>

                <li className={styles.item}>
                    <span className={styles.parent}>
                        <UserOutlined className={styles.icon} />
                        My Account
                    </span>
                </li>

                <li className={styles.sep} aria-hidden>
                    <RightOutlined />
                </li>

                <li className={styles.item}>
                    <span className={styles.active} aria-current="page">
                        {leafLabel}
                    </span>
                </li>
            </ol>
        </nav>
    );
};

export default ProfileBreadcrumb;
