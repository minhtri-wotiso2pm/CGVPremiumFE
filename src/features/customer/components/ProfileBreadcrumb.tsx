import type { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HomeOutlined, UserOutlined, RightOutlined } from "@ant-design/icons";
import { PROFILE_BREADCRUMB_MAP } from "../constants/profile.constants";
import styles from "./Profilebreadcrumb.module.css";

const ProfileBreadcrumb: FC = () => {
    const { pathname } = useLocation();
    const { t } = useTranslation("profile");
    const leafLabel = t(PROFILE_BREADCRUMB_MAP[pathname] ?? "profile:nav.profile");

    return (
        <nav aria-label="Breadcrumb" className={styles.root}>
            <ol className={styles.list}>
                <li className={styles.item}>
                    <Link to="/customer" className={styles.link} aria-label={t("breadcrumb.home")}>
                        <HomeOutlined className={styles.icon} />
                        {t("breadcrumb.home")}
                    </Link>
                </li>

                <li className={styles.sep} aria-hidden>
                    <RightOutlined />
                </li>

                <li className={styles.item}>
                    <span className={styles.parent}>
                        <UserOutlined className={styles.icon} />
                        {t("sidebar.myAccount")}
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
