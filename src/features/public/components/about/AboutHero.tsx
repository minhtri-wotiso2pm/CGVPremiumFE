import { type FC, type PointerEvent, useEffect, useRef, useState } from "react";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { EASE_SMOOTH } from "./motionVariants";

const ChevronDownIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const DUST_COUNT = 12;

interface DustSeed {
    id: number;
    left: number;
    size: number;
    duration: number;
    delay: number;
    drift: number;
}

/** Math.random must not run during render (React purity rules) — this is
 *  only ever called from inside a useEffect, once, on mount. */
function generateDustSeeds(): DustSeed[] {
    return Array.from({ length: DUST_COUNT }, (_, i) => ({
        id: i,
        left: 6 + Math.random() * 88,
        size: 2 + Math.random() * 3,
        duration: 7 + Math.random() * 7,
        delay: Math.random() * 6,
        drift: (Math.random() - 0.5) * 40,
    }));
}

/** Fullscreen cinematic intro: the logo fades in, a shimmer sweeps once
 *  through its red brand gradient (a background-position tween clipped to
 *  the letterforms — no separate overlay box, so it can't misalign the way
 *  a translated sweep element did), then settles into a soft ambient glow
 *  that tilts gently toward the cursor, with drifting dust motes behind
 *  it. The whole section fades + scales down as the user scrolls into
 *  Brand Story, reading as one continuous camera move. */
const AboutHero: FC = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const reduceMotion = useReducedMotion();
    const isNarrow = useMediaQuery("(max-width: 768px)");
    const showAmbientFx = !reduceMotion && !isNarrow;

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

    // Cursor-follow tilt on the logo — subtle, spring-smoothed, desktop only.
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const springX = useSpring(mx, { stiffness: 50, damping: 18, mass: 0.4 });
    const springY = useSpring(my, { stiffness: 50, damping: 18, mass: 0.4 });
    const tiltX = useTransform(springY, [-0.5, 0.5], [5, -5]);
    const tiltY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

    const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
        if (!showAmbientFx) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const resetTilt = () => {
        mx.set(0);
        my.set(0);
    };

    const [dustSeeds, setDustSeeds] = useState<DustSeed[]>([]);
    useEffect(() => {
        const id = setTimeout(() => setDustSeeds(showAmbientFx ? generateDustSeeds() : []), 0);
        return () => clearTimeout(id);
    }, [showAmbientFx]);

    return (
        <section
            className="abt-hero"
            ref={sectionRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetTilt}
        >
            <div className="abt-hero__bg" aria-hidden="true" />

            {dustSeeds.length > 0 && (
                <div className="abt-hero__dust" aria-hidden="true">
                    {dustSeeds.map((d) => (
                        <motion.span
                            key={d.id}
                            className="abt-hero__dust-mote"
                            style={{ left: `${d.left}%`, width: d.size, height: d.size }}
                            animate={{ y: [0, -60, 0], x: [0, d.drift, 0], opacity: [0, 0.7, 0] }}
                            transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
                        />
                    ))}
                </div>
            )}

            <motion.div
                className="abt-hero__content"
                style={reduceMotion ? undefined : { opacity: heroOpacity, scale: heroScale }}
            >
                <motion.div
                    className="abt-hero__logo-wrap"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: EASE_SMOOTH }}
                    style={{ rotateX: tiltX, rotateY: tiltY }}
                >
                    <motion.span
                        className="abt-hero__logo"
                        initial={{ backgroundPosition: reduceMotion ? "0% 0%" : "180% 0%" }}
                        animate={{ backgroundPosition: "-60% 0%" }}
                        transition={{ duration: 1.7, ease: EASE_SMOOTH, delay: 0.6 }}
                    >
                        CVPREMIUM
                    </motion.span>
                    <span className="abt-hero__logo-dot" aria-hidden="true" />
                </motion.div>

                <motion.p
                    className="abt-hero__tagline"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: EASE_SMOOTH, delay: 1.15 }}
                >
                    Cinema, reimagined for every story worth telling.
                </motion.p>

                <motion.div
                    className="abt-hero__scroll-cue"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, ease: EASE_SMOOTH, delay: 1.7 }}
                >
                    <span>Discover our story</span>
                    <ChevronDownIcon />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default AboutHero;
