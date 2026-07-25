import type { Transition } from "framer-motion";

export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

export const springGentle: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 20,
    mass: 0.8,
};

export const springSnap: Transition = {
    type: "spring",
    stiffness: 500,
    damping: 25,
    mass: 0.5,
};

export const hoverTransition: Transition = {
    duration: 0.25,
    ease: EASE_SMOOTH,
};

export const clickTransition: Transition = {
    duration: 0.18,
    ease: "easeInOut",
};

export const happyTransition: Transition = {
    duration: 0.6,
    ease: EASE_SMOOTH,
};

export const errorTransition: Transition = {
    duration: 0.5,
    ease: "easeInOut",
};

export const sleepTransition: Transition = {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
};

export const exitTransition: Transition = {
    duration: 0.2,
    ease: EASE_SMOOTH,
};
