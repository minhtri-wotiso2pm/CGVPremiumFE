import type { FC } from "react";
import { useTranslation } from "react-i18next";

const CinemaScreen: FC = () => {
    const { t } = useTranslation("booking");
    return (
        <div className="cgv-seats-screen-wrapper" aria-hidden="true">
            <span className="cgv-seats-screen" />
            <span className="cgv-seats-screen-label">{t("seats.screen")}</span>
        </div>
    );
};

export default CinemaScreen;
