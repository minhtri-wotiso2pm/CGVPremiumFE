import { type FC } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { revealUp, staggerContainer, viewportOnce } from "./motionVariants";

const QuoteIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9.5 8C6.5 8 4 10.5 4 14v6h6v-6H7.2C7.2 12 8.7 10.5 10.5 10.3L9.5 8zm10 0c-3 0-5.5 2.5-5.5 6v6h6v-6h-2.8c0-2 1.5-3.5 3.3-3.7L19.5 8z" />
    </svg>
);

const TESTIMONIALS = [
    { quoteKey: "about.testi1Quote", name: "Minh T.", roleKey: "about.testi1Role" },
    { quoteKey: "about.testi2Quote", name: "Lan P.", roleKey: "about.testi2Role" },
    { quoteKey: "about.testi3Quote", name: "Duc H.", roleKey: "about.testi3Role" },
];

/** Social proof — short guest quotes, kept simple (no pinning) so not
 *  every section relies on the same scrollytelling trick. */
const TestimonialsSection: FC = () => {
    const { t } = useTranslation("public");
    return (
    <section className="abt-testi">
        <div className="abt-testi__inner">
            <motion.p
                className="abt-eyebrow"
                variants={revealUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
            >
                {t("about.whatGuestsSay")}
            </motion.p>

            <motion.div
                className="abt-testi__grid"
                variants={staggerContainer(0.15)}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
            >
                {TESTIMONIALS.map((item) => (
                    <motion.div key={item.name} className="abt-testi__card" variants={revealUp}>
                        <span className="abt-testi__quote-icon"><QuoteIcon /></span>
                        <p className="abt-testi__quote">{t(item.quoteKey)}</p>
                        <div className="abt-testi__author">
                            <span className="abt-testi__name">{item.name}</span>
                            <span className="abt-testi__role">{t(item.roleKey)}</span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    </section>
    );
};

export default TestimonialsSection;
