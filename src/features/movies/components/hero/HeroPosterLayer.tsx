import { type FC } from "react";
import { useTranslation } from "react-i18next";

interface Props {
    posterUrl: string;
    fallbackUrl: string;
    title: string;
    active: boolean;
    videoPlaying: boolean;
    showTapToPlay: boolean;
    onTapPlay: () => void;
}

const PlayIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
);

/** PosterLayer — the default state for every slide; only the active
 *  slide crossfades toward its VideoLayer once a trailer starts playing. */
const HeroPosterLayer: FC<Props> = ({
    posterUrl, fallbackUrl, title, active, videoPlaying, showTapToPlay, onTapPlay,
}) => {
    const { t } = useTranslation("movies");
    return (
    <div
        className={`cgv-hposter${active ? " cgv-hposter--active" : ""}${videoPlaying ? " cgv-hposter--hidden" : ""}`}
    >
        <img
            src={posterUrl || fallbackUrl}
            alt={title}
            className="cgv-hposter__img"
            loading={active ? "eager" : "lazy"}
        />
        {showTapToPlay && (
            <button
                type="button"
                className="cgv-hposter__tap"
                onClick={onTapPlay}
                aria-label={t("hero.playTrailer", { title })}
            >
                <PlayIcon />
            </button>
        )}
    </div>
    );
};

export default HeroPosterLayer;
