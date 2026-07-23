import { type FC, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { EASE_SMOOTH } from "./motionVariants";
import heroVideo from "@/assets/videos/HeroVideo.mp4";
import heroPoster from "@/assets/videos/hero-poster-hd.jpg";

const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

/**
 * Cinematic video hero for the About page.
 *
 * The background is a 16:9 HD vortex of 35mm film strips spiralling into a
 * black vanishing point (warm amber/red on near-black). On a widescreen desktop
 * the footage covers with almost no crop, so the source watermark (bottom-right)
 * is masked by the scrim's corner vignette; on a tall/mobile viewport the sides
 * are cropped, taking the right-edge watermark with them. The layered scrim
 * darkens the lower-left so the copy — anchored to the lower-left third (rule of
 * thirds) — never sits over the swirl's "eye" near the centre.
 *
 * Performance notes:
 *  - The 22MB clip is never part of the LCP: the ~58KB poster paints first
 *    (preload="none"), and the source is attached + played from an effect after
 *    first paint. An IntersectionObserver then pauses decoding whenever the hero
 *    scrolls off-screen and resumes on return.
 *  - Parallax is a single framer-motion motion value fed by one passive, rAF-
 *    throttled scroll listener; the derived transforms are compositor-driven, so
 *    there is no React re-render per frame. Only one state toggle exists (the
 *    poster→video fade). `prefers-reduced-motion` falls back to the still poster
 *    and skips both the video and the scroll listener entirely.
 */
const AboutHero: FC = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    // Latches true once the clip has played through, so it never restarts.
    const endedRef = useRef(false);
    const reduceMotion = useReducedMotion();

    // `ready` fades the video in over the poster once it can actually paint.
    const [ready, setReady] = useState(false);

    // Scroll progress through the hero (0 at the top, 1 once it has scrolled a
    // full viewport up). Driven by a manual rAF scroll listener below rather
    // than framer's useScroll — matching this feature's existing approach (see
    // motionVariants.bandValue) and sidestepping useScroll's target tracking,
    // which stays pinned at 0 in this layout.
    const progress = useMotionValue(0);
    // Subtle parallax: the media layer is oversized (see .abt-hero__media in
    // about.css), so drifting it never exposes an edge.
    const mediaY = useTransform(progress, [0, 1], ["0%", "9%"]);
    const mediaScale = useTransform(progress, [0, 1], [1, 1.08]);
    const contentY = useTransform(progress, [0, 1], [0, -70]);
    const contentOpacity = useTransform(progress, [0, 0.75], [1, 0]);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el || reduceMotion) return;

        let raf = 0;
        const measure = () => {
            raf = 0;
            const rect = el.getBoundingClientRect();
            const p = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
            progress.set(p);
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(measure);
        };
        measure();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [reduceMotion, progress]);

    // Attach the source and start playback after first paint — the poster is
    // the LCP, so the clip only begins streaming once the initial render is on
    // screen. This is deliberately NOT gated on the IntersectionObserver below:
    // the hero is always above the fold, and some embedded browsers never fire
    // IO, which would leave it stuck on the poster.
    //
    // The clip plays through ONCE and then holds on its final frame (no loop —
    // the endless spinning vortex was dizzying). `endedRef` latches on the
    // `ended` event so the observer's resume-on-return never restarts it; after
    // it finishes, scrolling back to the hero just shows that frozen last frame.
    useEffect(() => {
        const el = videoRef.current;
        if (!el || reduceMotion) return;

        const playOnce = () => {
            if (endedRef.current) return;
            void el.play().catch(() => {
                /* autoplay blocked — poster remains, no throw */
            });
        };

        if (!el.src) el.src = heroVideo;
        playOnce();

        const observer = new IntersectionObserver(
            ([entry]) => (entry.isIntersecting ? playOnce() : el.pause()),
            { threshold: 0.01 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [reduceMotion]);

    return (
        <section className="abt-hero" ref={sectionRef}>
            <motion.div
                className="abt-hero__media"
                style={reduceMotion ? undefined : { y: mediaY, scale: mediaScale }}
            >
                <video
                    ref={videoRef}
                    className="abt-hero__video"
                    poster={heroPoster}
                    muted
                    playsInline
                    preload="none"
                    disablePictureInPicture
                    aria-hidden="true"
                    tabIndex={-1}
                    onCanPlay={() => setReady(true)}
                    onEnded={() => {
                        endedRef.current = true;
                    }}
                    /* Inline opacity so the fade-in is driven by state alone, free of
                       any cascade ambiguity. Reduced motion keeps the still poster
                       fully visible (the clip never plays). */
                    style={{ opacity: reduceMotion || ready ? 1 : 0 }}
                />
            </motion.div>

            <div className="abt-hero__scrim" aria-hidden="true" />

            <motion.div
                className="abt-hero__content"
                style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
            >
                <motion.p
                    className="abt-hero__eyebrow"
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE_SMOOTH, delay: 0.2 }}
                >
                    <span className="abt-hero__eyebrow-rule" />
                    Est. Cinematic Experience
                </motion.p>

                <h1 className="abt-hero__title">
                    <motion.span
                        className="abt-hero__title-line"
                        initial={reduceMotion ? false : { opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: EASE_SMOOTH, delay: 0.35 }}
                    >
                        <motion.span
                            className="abt-hero__logo"
                            initial={reduceMotion ? false : { backgroundPosition: "180% 0%" }}
                            animate={{ backgroundPosition: "-60% 0%" }}
                            transition={{ duration: 1.8, ease: EASE_SMOOTH, delay: 0.7 }}
                        >
                            CVPREMIUM
                        </motion.span>
                        <span className="abt-hero__logo-dot" aria-hidden="true" />
                    </motion.span>
                </h1>

                <motion.p
                    className="abt-hero__tagline"
                    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: EASE_SMOOTH, delay: 0.85 }}
                >
                    Cinema, reimagined for every story worth telling — where each
                    frame becomes a memory worth returning to.
                </motion.p>

                <motion.div
                    className="abt-hero__scroll-cue"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, ease: EASE_SMOOTH, delay: 1.3 }}
                >
                    <span className="abt-hero__scroll-track" aria-hidden="true">
                        <span className="abt-hero__scroll-dot" />
                    </span>
                    <span className="abt-hero__scroll-label">
                        Discover our story <ChevronDownIcon />
                    </span>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default AboutHero;
