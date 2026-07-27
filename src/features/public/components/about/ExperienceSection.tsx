import { type FC, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useReducedMotion, useMotionValueEvent } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { EASE_SMOOTH, bandValue, revealUp, staggerContainer, viewportOnce } from "./motionVariants";

const SeatIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 3h16a1 1 0 011 1v7a4 4 0 01-4 4H7a4 4 0 01-4-4V4a1 1 0 011-1z" />
        <path d="M4 15v4a1 1 0 001 1h14a1 1 0 001-1v-4" />
        <line x1="8" y1="20" x2="8" y2="23" />
        <line x1="16" y1="20" x2="16" y2="23" />
    </svg>
);

const ScreenIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

const SoundIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 010 7.07" />
        <path d="M19.07 4.93a10 10 0 010 14.14" />
    </svg>
);

const EXPERIENCES = [
    { icon: <SeatIcon />, titleKey: "about.expSeatingTitle", descKey: "about.expSeatingDesc" },
    { icon: <ScreenIcon />, titleKey: "about.expScreensTitle", descKey: "about.expScreensDesc" },
    { icon: <SoundIcon />, titleKey: "about.expSoundTitle", descKey: "about.expSoundDesc" },
];

// Card crossfade bands + horizontal track position, computed as plain
// numbers from a single scroll listener (see bandValue) rather than one
// useTransform per value — scroll-linked useTransform chains can fall out
// of sync with the true scroll position under Framer Motion's WAAPI-based
// optimization for large/instant scroll jumps.
const CARD_BANDS: [number, number][][] = [
    [[0, 1], [0.22, 1], [0.3, 0]],
    [[0.28, 0], [0.36, 1], [0.6, 1], [0.68, 0]],
    [[0.66, 0], [0.74, 1], [1, 1]],
];

/** Apple-style pinned horizontal reveal on desktop: the section stays put
 *  while a full-bleed feature panel slides through for each experience,
 *  in sync with a dot-and-progress indicator. Falls back to the original
 *  staggered card grid on mobile/reduced-motion. */
const ExperienceSection: FC = () => {
    const { t } = useTranslation("public");
    const reduceMotion = useReducedMotion();
    const isNarrow = useMediaQuery("(max-width: 768px)");
    const usePinned = !reduceMotion && !isNarrow;

    const pinRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: pinRef,
        offset: ["start start", "end end"],
    });

    const [progress, setProgress] = useState(0);
    useMotionValueEvent(scrollYProgress, "change", setProgress);

    const trackX = `${bandValue(progress, [[0, 0], [1, -66.6667]])}%`;
    const cardOpacities = CARD_BANDS.map((points) => bandValue(progress, points));

    if (!usePinned) {
        return (
            <section className="abt-exp">
                <div className="abt-exp__inner">
                    <motion.p
                        className="abt-eyebrow"
                        variants={revealUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        {t("about.theExperience")}
                    </motion.p>
                    <motion.h2
                        className="abt-section-title"
                        variants={revealUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        {t("about.expHeadline")}
                    </motion.h2>

                    <motion.div
                        className="abt-exp__grid"
                        variants={staggerContainer(0.16)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        {EXPERIENCES.map((item) => (
                            <motion.div
                                key={item.titleKey}
                                className="abt-exp__card"
                                variants={revealUp}
                                whileHover={{ y: -6, scale: 1.02 }}
                                transition={{ duration: 0.35, ease: EASE_SMOOTH }}
                            >
                                <div className="abt-exp__icon">{item.icon}</div>
                                <h3 className="abt-exp__title">{t(item.titleKey)}</h3>
                                <p className="abt-exp__desc">{t(item.descKey)}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className="abt-exp-pin" ref={pinRef}>
            <div className="abt-exp-pin__sticky">
                <div className="abt-exp-pin__head">
                    <p className="abt-eyebrow">{t("about.theExperience")}</p>
                    <h2 className="abt-section-title">{t("about.expHeadline")}</h2>
                </div>

                <div className="abt-exp-pin__viewport">
                    <motion.div className="abt-exp-pin__track" style={{ x: trackX }}>
                        {EXPERIENCES.map((item, i) => (
                            <div key={item.titleKey} className="abt-exp-pin__panel" style={{ opacity: cardOpacities[i] }}>
                                <span className="abt-exp-pin__index">0{i + 1}</span>
                                <div className="abt-exp__icon abt-exp-pin__icon">{item.icon}</div>
                                <h3 className="abt-exp-pin__title">{t(item.titleKey)}</h3>
                                <p className="abt-exp-pin__desc">{t(item.descKey)}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="abt-pin__dots" aria-hidden="true">
                    {EXPERIENCES.map((_, i) => (
                        <span key={i} className="abt-pin__dot">
                            <span className="abt-pin__dot-fill" style={{ opacity: cardOpacities[i] }} />
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ExperienceSection;
