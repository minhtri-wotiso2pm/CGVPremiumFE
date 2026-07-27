import { type FC, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll } from "framer-motion";
import { revealUp, staggerContainer, viewportOnce } from "./motionVariants";

const MILESTONES = [
    { year: "2011", titleKey: "about.ms2011Title", descKey: "about.ms2011Desc" },
    { year: "2015", titleKey: "about.ms2015Title", descKey: "about.ms2015Desc" },
    { year: "2019", titleKey: "about.ms2019Title", descKey: "about.ms2019Desc" },
    { year: "2023", titleKey: "about.ms2023Title", descKey: "about.ms2023Desc" },
    { year: "2026", titleKey: "about.ms2026Title", descKey: "about.ms2026Desc" },
];

/** Alternating milestone timeline with a vertical line that fills in as
 *  the section scrolls through view — a lightweight progress cue rather
 *  than a literal scrollbar. */
const TimelineSection: FC = () => {
    const { t } = useTranslation("public");
    const trackRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: trackRef,
        offset: ["start 0.85", "end 0.4"],
    });

    return (
        <section className="abt-timeline">
            <div className="abt-timeline__inner">
                <motion.p
                    className="abt-eyebrow"
                    variants={revealUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                >
                    {t("about.ourJourney")}
                </motion.p>
                <motion.h2
                    className="abt-section-title"
                    variants={revealUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                >
                    {t("about.journeyHeadline")}
                </motion.h2>

                <div className="abt-timeline__track" ref={trackRef}>
                    <div className="abt-timeline__line" aria-hidden="true">
                        <motion.div className="abt-timeline__line-fill" style={{ scaleY: scrollYProgress }} />
                    </div>

                    <motion.ol
                        className="abt-timeline__list"
                        variants={staggerContainer(0.2)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        {MILESTONES.map((m, i) => (
                            <motion.li
                                key={m.year}
                                className={`abt-timeline__item${i % 2 === 1 ? " abt-timeline__item--right" : ""}`}
                                variants={revealUp}
                            >
                                <span className="abt-timeline__dot" aria-hidden="true" />
                                <span className="abt-timeline__year">{m.year}</span>
                                <h3 className="abt-timeline__title">{t(m.titleKey)}</h3>
                                <p className="abt-timeline__desc">{t(m.descKey)}</p>
                            </motion.li>
                        ))}
                    </motion.ol>
                </div>
            </div>
        </section>
    );
};

export default TimelineSection;
