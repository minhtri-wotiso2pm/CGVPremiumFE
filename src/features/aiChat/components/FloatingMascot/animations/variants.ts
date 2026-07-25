import type { Variants } from "framer-motion";
import {
    EASE_SMOOTH,
    hoverTransition,
    springGentle,
    clickTransition,
    happyTransition,
    errorTransition,
    sleepTransition,
} from "./transitions";

export const containerVariants: Variants = {
    idle: {
        y: [0, -2, 0, 2, 0],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
    hover: {
        y: 0,
        scale: 1.06,
        rotate: -8,
        transition: hoverTransition,
    },
    wave: {
        y: [0, -3, 0],
        rotate: [0, -5, 0],
        transition: { duration: 0.6, ease: EASE_SMOOTH },
    },
    thinking: {
        y: [0, -1, 0, 1, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
    click: {
        scale: [1, 0.95, 1.05, 1],
        rotate: [0, 2, -2, 0],
        transition: clickTransition,
    },
    happy: {
        y: [0, -8, 0],
        rotate: [0, 3, -3, 0],
        transition: happyTransition,
    },
    error: {
        x: [0, -3, 3, -2, 2, 0],
        rotate: [0, -2, 2, -1, 1, 0],
        transition: errorTransition,
    },
    sleep: {
        y: [0, -1, 0],
        transition: sleepTransition,
    },
    roaming: {
        y: [0, -3, 0, 3, 0],
        rotate: [0, 1, -1, 1, 0],
        transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    landing: {
        scaleY: [1, 0.75, 1.1, 1],
        scaleX: [1, 1.15, 0.95, 1],
        transition: { duration: 0.35, ease: "easeInOut" },
    },
};

export const bodyVariants: Variants = {
    idle: { rotate: 0, transition: springGentle },
    hover: { rotate: 0, transition: hoverTransition },
    thinking: { rotate: -2, transition: springGentle },
    click: { scale: [1, 0.97, 1.03, 1], transition: clickTransition },
    happy: { rotate: [0, 2, -2, 0], transition: happyTransition },
    error: { rotate: [0, -1, 1, 0], transition: errorTransition },
    sleep: { rotate: -1, transition: springGentle },
    roaming: {
        y: [0, -1, 0],
        rotate: [0, 0.5, -0.5, 0],
        transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    landing: {
        scaleY: [1, 0.8, 1.08, 1],
        transition: { duration: 0.35, ease: "easeInOut" },
    },
};

export const popcornVariants: Variants = {
    idle: {
        scale: [1, 1.02, 0.98, 1.02, 1],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
    hover: { scale: 1.04, transition: hoverTransition },
    thinking: {
        scale: [1, 1.01, 0.99, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
    happy: {
        scale: [1, 1.06, 1],
        transition: happyTransition,
    },
    click: {
        scale: [1, 0.98, 1.02, 1],
        transition: clickTransition,
    },
    error: {
        scale: [1, 0.97, 1],
        transition: errorTransition,
    },
    sleep: { scale: 1, transition: springGentle },
    roaming: {
        scale: [1, 1.02, 0.98, 1],
        transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    landing: { scale: [1, 1.1, 0.95, 1], transition: { duration: 0.35, ease: "easeInOut" } },
};

export const rightArmVariants: Variants = {
    idle: { rotate: 0, transition: springGentle },
    hover: { rotate: -45, transition: hoverTransition },
    wave: {
        rotate: [-45, -30, -45, -30, -45],
        transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
    },
    thinking: { rotate: 35, transition: springGentle },
    click: { rotate: -10, transition: clickTransition },
    happy: { rotate: -15, transition: happyTransition },
    error: { rotate: 5, transition: errorTransition },
    sleep: { rotate: 0, transition: springGentle },
    roaming: {
        rotate: [-3, 0, -3],
        transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    landing: { rotate: 0, transition: springGentle },
};

export const leftArmVariants: Variants = {
    idle: { rotate: 0, transition: springGentle },
    hover: { rotate: 0, transition: hoverTransition },
    thinking: { rotate: -30, transition: springGentle },
    click: { rotate: 10, transition: clickTransition },
    happy: { rotate: -5, transition: happyTransition },
    error: { rotate: -5, transition: errorTransition },
    sleep: { rotate: 0, transition: springGentle },
    roaming: {
        rotate: [2, 0, 2],
        transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    landing: { rotate: 0, transition: springGentle },
};

export const eyesVariants: Variants = {
    idle: { y: 0, transition: springGentle },
    hover: { y: 0, transition: hoverTransition },
    thinking: { y: -4, transition: springGentle },
    lookingAround: { x: 4, transition: springGentle },
    click: { scaleY: [1, 0.1, 1], transition: clickTransition },
    happy: { y: -2, transition: happyTransition },
    error: { y: 0, transition: errorTransition },
    sleep: { scaleY: 0.2, transition: springGentle },
    roaming: { y: 0, transition: springGentle },
    landing: { scaleY: [1, 0.1, 1], transition: { duration: 0.3 } },
};

export const mouthVariants: Variants = {
    idle: { opacity: 1, transition: { duration: 0.15 } },
    hover: { opacity: 0, transition: { duration: 0.15 } },
    thinking: { opacity: 1, transition: { duration: 0.15 } },
    happy: { opacity: 0, transition: { duration: 0.15 } },
    click: { opacity: 1, transition: { duration: 0.1 } },
    error: { opacity: 1, transition: { duration: 0.15 } },
    sleep: { opacity: 1, transition: { duration: 0.15 } },
    roaming: { opacity: 1, transition: { duration: 0.15 } },
    landing: { opacity: 1, transition: { duration: 0.15 } },
};

export const mouthHappyVariants: Variants = {
    idle: { opacity: 0, transition: { duration: 0.15 } },
    hover: { opacity: 1, transition: { duration: 0.15 } },
    thinking: { opacity: 0, transition: { duration: 0.15 } },
    happy: { opacity: 1, transition: { duration: 0.15 } },
    click: { opacity: 0, transition: { duration: 0.1 } },
    error: { opacity: 0, transition: { duration: 0.15 } },
    sleep: { opacity: 0, transition: { duration: 0.15 } },
    roaming: { opacity: 0, transition: { duration: 0.15 } },
    landing: { opacity: 0, transition: { duration: 0.15 } },
};

export const zzzVariants: Variants = {
    idle: { opacity: 0 },
    sleep: {
        opacity: [0, 0.8, 0.6, 0.3, 0],
        y: [0, -4, -8, -12, -16],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
};
