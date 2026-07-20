import type { Variants, Transition } from "framer-motion";

export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

const panelTransition: Transition = { duration: 0.22, ease: EASE_SMOOTH };

export const panelVariants: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: panelTransition },
    exit: { opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.15, ease: EASE_SMOOTH } },
};

export const messageVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE_SMOOTH } },
};
