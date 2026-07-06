import { type FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { revealUp, viewportOnce } from "./motionVariants";

/** Closing call-to-action — sends guests to the public movie list and
 *  signed-in customers to their own dashboard, matching the logoHref
 *  pattern used across the rest of the public pages. */
const CtaSection: FC = () => {
    const user = useAppSelector((s) => s.auth.user);
    const bookHref = user ? "/customer" : "/";

    return (
        <section className="abt-cta">
            <div className="abt-cta__bg" aria-hidden="true" />

            <motion.div
                className="abt-cta__content"
                variants={revealUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
            >
                <h2 className="abt-cta__title">Book Your Experience</h2>
                <p className="abt-cta__sub">Step into the story. Reserve your seat at the cinema built for it.</p>
                <Link to={bookHref} className="abt-cta__btn">
                    Book Now
                </Link>
            </motion.div>
        </section>
    );
};

export default CtaSection;
