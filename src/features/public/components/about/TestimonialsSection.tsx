import { type FC } from "react";
import { motion } from "framer-motion";
import { revealUp, staggerContainer, viewportOnce } from "./motionVariants";

const QuoteIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9.5 8C6.5 8 4 10.5 4 14v6h6v-6H7.2C7.2 12 8.7 10.5 10.5 10.3L9.5 8zm10 0c-3 0-5.5 2.5-5.5 6v6h6v-6h-2.8c0-2 1.5-3.5 3.3-3.7L19.5 8z" />
    </svg>
);

const TESTIMONIALS = [
    {
        quote: "The best screen in the city, hands down. I don't watch anywhere else anymore.",
        name: "Minh T.",
        role: "Weekly Moviegoer",
    },
    {
        quote: "Reclining seats and Dolby Atmos completely changed how I feel about going to the cinema.",
        name: "Lan P.",
        role: "CGV Premium Member since 2021",
    },
    {
        quote: "Booking is effortless and the picture quality is unreal. Every screening feels like an event.",
        name: "Duc H.",
        role: "First-time Visitor",
    },
];

/** Social proof — short guest quotes, kept simple (no pinning) so not
 *  every section relies on the same scrollytelling trick. */
const TestimonialsSection: FC = () => (
    <section className="abt-testi">
        <div className="abt-testi__inner">
            <motion.p
                className="abt-eyebrow"
                variants={revealUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
            >
                What Guests Say
            </motion.p>

            <motion.div
                className="abt-testi__grid"
                variants={staggerContainer(0.15)}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
            >
                {TESTIMONIALS.map((t) => (
                    <motion.div key={t.name} className="abt-testi__card" variants={revealUp}>
                        <span className="abt-testi__quote-icon"><QuoteIcon /></span>
                        <p className="abt-testi__quote">{t.quote}</p>
                        <div className="abt-testi__author">
                            <span className="abt-testi__name">{t.name}</span>
                            <span className="abt-testi__role">{t.role}</span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    </section>
);

export default TestimonialsSection;
