import { type FC, useEffect, useRef, useState } from "react";
import { motion, animate, useInView, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH, revealUp, staggerContainer, viewportOnce } from "./motionVariants";

interface Stat {
    value: number;
    suffix: string;
    label: string;
}

const STATS: Stat[] = [
    { value: 50, suffix: "+", label: "Cinemas Nationwide" },
    { value: 15, suffix: "", label: "Years of Premium Cinema" },
    { value: 100, suffix: "%", label: "4K Laser Projection" },
    { value: 1, suffix: "M+", label: "Guests Every Month" },
];

/** Counts up from 0 to `to` once the number scrolls into view. Uses
 *  Framer Motion's imperative `animate()` (not a bare setState call) so
 *  it stays compliant with the set-state-in-effect rule — reduced motion
 *  is handled by dropping the duration to 0 rather than skipping animate
 *  entirely, since `onUpdate` still needs to be the thing that calls
 *  setState. */
const Counter: FC<{ to: number; suffix: string }> = ({ to, suffix }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    const reduceMotion = useReducedMotion();
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const controls = animate(0, to, {
            duration: reduceMotion ? 0 : 1.6,
            ease: EASE_SMOOTH,
            onUpdate: (v) => setValue(Math.round(v)),
        });
        return () => controls.stop();
    }, [isInView, to, reduceMotion]);

    return (
        <span ref={ref} className="abt-stats__num">
            {value.toLocaleString()}{suffix}
        </span>
    );
};

/** "By the Numbers" — social-proof stats that count up as they scroll
 *  into view, reinforcing the Brand Story with scale/credibility. */
const StatsSection: FC = () => (
    <section className="abt-stats">
        <div className="abt-stats__inner">
            <motion.p
                className="abt-eyebrow"
                variants={revealUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
            >
                By The Numbers
            </motion.p>

            <motion.div
                className="abt-stats__grid"
                variants={staggerContainer(0.12)}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
            >
                {STATS.map((s) => (
                    <motion.div key={s.label} className="abt-stats__item" variants={revealUp}>
                        <Counter to={s.value} suffix={s.suffix} />
                        <p className="abt-stats__label">{s.label}</p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    </section>
);

export default StatsSection;
