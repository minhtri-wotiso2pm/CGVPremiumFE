import { type FC } from "react";
import { useTranslation } from "react-i18next";

interface Props {
    showNav: boolean;
    onPrev: () => void;
    onNext: () => void;
    showMute: boolean;
    muted: boolean;
    pulsing: boolean;
    onToggleMute: () => void;
}

const ChevronLeft = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const ChevronRight = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);
const MuteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
);
const UnmuteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 010 7.07" />
        <path d="M19.07 4.93a10 10 0 010 14.14" />
    </svg>
);

/** Controls — prev/next navigation + the mute toggle (pulses gently while
 *  a trailer is actively playing muted, per the brief). */
const HeroControls: FC<Props> = ({ showNav, onPrev, onNext, showMute, muted, pulsing, onToggleMute }) => {
    const { t } = useTranslation("movies");
    return (
    <>
        {showNav && (
            <>
                <button type="button" className="cgv-hnav cgv-hnav--prev" onClick={onPrev} aria-label={t("hero.prevMovie")}>
                    <ChevronLeft />
                </button>
                <button type="button" className="cgv-hnav cgv-hnav--next" onClick={onNext} aria-label={t("hero.nextMovie")}>
                    <ChevronRight />
                </button>
            </>
        )}

        {showMute && (
            <button
                type="button"
                className={`cgv-hmute${pulsing ? " cgv-hmute--pulse" : ""}`}
                onClick={onToggleMute}
                aria-label={muted ? t("hero.unmute") : t("hero.mute")}
                aria-pressed={!muted}
            >
                {muted ? <MuteIcon /> : <UnmuteIcon />}
            </button>
        )}
    </>
    );
};

export default HeroControls;
