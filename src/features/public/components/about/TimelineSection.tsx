import { type FC, useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { revealUp, staggerContainer, viewportOnce } from "./motionVariants";

const MILESTONES = [
    { year: "2011", title: "The First Screen", desc: "CV Premium opens its flagship cinema, built around a single idea: picture and sound quality shouldn't be a premium tier — they should be the standard." },
    { year: "2015", title: "Nationwide Expansion", desc: "New locations open across the country's major cities, each one built to the same spec as the flagship rather than a scaled-down version of it." },
    { year: "2019", title: "IMAX & Dolby Atmos", desc: "Large-format screens and object-based surround sound roll out chain-wide, turning every premium hall into a genuine destination screening." },
    { year: "2023", title: "Premium Redefined", desc: "Reclining seating, app-based booking and a rebuilt loyalty program bring the in-cinema and online experience onto the same standard." },
    { year: "2026", title: "CV Premium Today", desc: "Now operating across dozens of cinemas nationwide, still measuring every new room against the one that started it all." },
];

/** Alternating milestone timeline with a vertical line that fills in as
 *  the section scrolls through view — a lightweight progress cue rather
 *  than a literal scrollbar. */
const TimelineSection: FC = () => {
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
                    Our Journey
                </motion.p>
                <motion.h2
                    className="abt-section-title"
                    variants={revealUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                >
                    A decade, one standard
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
                                <h3 className="abt-timeline__title">{m.title}</h3>
                                <p className="abt-timeline__desc">{m.desc}</p>
                            </motion.li>
                        ))}
                    </motion.ol>
                </div>
            </div>
        </section>
    );
};

export default TimelineSection;
