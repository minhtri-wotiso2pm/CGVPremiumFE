import { type FC, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion, useMotionValueEvent } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { bandValue, revealUp, staggerContainer, viewportOnce } from "./motionVariants";

const STORY_PARAGRAPHS = [
    "CV Premium began with a simple belief: a great film deserves a great room to live in. Not just a screen and a row of seats, but a space built entirely around the moment the lights go down.",
    "What started as a single flagship cinema grew into a nationwide chain, one city at a time — each new location built on the same obsession with picture quality, sound, and comfort that defined the first.",
    "We don't think of ourselves as a chain of theaters. We think of ourselves as the last mile of every story a filmmaker tells — the room where their work finally becomes an experience.",
    "Today, CV Premium is where audiences come not just to watch a movie, but to feel one.",
];

// Fixed 4-paragraph bands — each crossfades in, holds, then fades for the
// next (last one holds through to the end of the pin). Computed as plain
// numbers from a single scroll listener (see bandValue) rather than one
// useTransform per paragraph, since scroll-linked useTransform chains can
// fall out of sync with the true scroll position under Framer Motion's
// WAAPI-based optimization for large/instant scroll jumps.
const BANDS: [number, number][][] = [
    [[0, 0], [0.06, 1], [0.21, 1], [0.27, 0]],
    [[0.25, 0], [0.31, 1], [0.46, 1], [0.52, 0]],
    [[0.5, 0], [0.56, 1], [0.71, 1], [0.77, 0]],
    [[0.75, 0], [0.81, 1]],
];

/** Apple-style pinned scrollytelling on desktop: the section stays fixed
 *  on screen for a tall scroll track while paragraphs crossfade one after
 *  another, over a softly parallaxing backdrop. Falls back to a normal
 *  stacked reveal-on-scroll on mobile/reduced-motion, where pinning would
 *  feel disorienting rather than premium. */
const BrandStorySection: FC = () => {
    const reduceMotion = useReducedMotion();
    const isNarrow = useMediaQuery("(max-width: 768px)");
    const usePinned = !reduceMotion && !isNarrow;

    const pinRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: pinRef,
        offset: ["start start", "end end"],
    });

    const bgY = useTransform(scrollYProgress, [0, 1], [-50, 50]);

    const [progress, setProgress] = useState(0);
    useMotionValueEvent(scrollYProgress, "change", setProgress);
    const bands = BANDS.map((points) => bandValue(progress, points));

    if (!usePinned) {
        return (
            <section className="abt-story">
                <div className="abt-story__bg" aria-hidden="true" />
                <div className="abt-story__scrim" aria-hidden="true" />
                <div className="abt-story__inner">
                    <motion.p
                        className="abt-eyebrow"
                        variants={revealUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        Our Story
                    </motion.p>
                    <motion.div
                        className="abt-story__paragraphs"
                        variants={staggerContainer(0.2)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        {STORY_PARAGRAPHS.map((p, i) => (
                            <motion.p key={i} className="abt-story__p" variants={revealUp}>
                                {p}
                            </motion.p>
                        ))}
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className="abt-story-pin" ref={pinRef}>
            <div className="abt-story-pin__sticky">
                <motion.div className="abt-story__bg" style={{ y: bgY }} aria-hidden="true" />
                <div className="abt-story__scrim" aria-hidden="true" />

                <div className="abt-story__inner abt-story__inner--pinned">
                    <p className="abt-eyebrow">Our Story</p>

                    <div className="abt-story-pin__stack">
                        {STORY_PARAGRAPHS.map((p, i) => (
                            <p key={i} className="abt-story__p abt-story__p--pinned" style={{ opacity: bands[i] }}>
                                {p}
                            </p>
                        ))}
                    </div>

                    <div className="abt-pin__dots" aria-hidden="true">
                        {STORY_PARAGRAPHS.map((_, i) => (
                            <span key={i} className="abt-pin__dot">
                                <span className="abt-pin__dot-fill" style={{ opacity: bands[i] }} />
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandStorySection;
