import { useMemo, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    burstKey: number;
}

interface Particle {
    id: number;
    angle: number;
    dist: number;
    size: number;
    delay: number;
    shape: number;
}

const COLORS = [
    "#FFD700",
    "#FFC107",
    "#FFB300",
    "#FFA000",
    "#FF8F00",
    "#FFD54F",
    "#FFE082",
    "#FFCC02",
];

const PopcornSplatter: FC<Props> = ({ burstKey }) => {
    const particles = useMemo<Particle[]>(() => {
        if (burstKey === 0) return [];
        return Array.from({ length: 16 }, (_, i) => {
            const angle = (i / 16) * Math.PI * 2 + (burstKey % 3) * 0.3;
            return {
                id: burstKey * 100 + i,
                angle,
                dist: 60 + Math.random() * 90,
                size: 10 + Math.random() * 14,
                delay: Math.random() * 0.06,
                shape: Math.random(),
            };
        });
    }, [burstKey]);

    return (
        <AnimatePresence>
            {particles.map((p) => {
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                const isRound = p.shape > 0.5;
                return (
                    <motion.div
                        key={p.id}
                        className="popcorn-particle"
                        style={{
                            width: p.size,
                            height: p.size,
                            borderRadius: isRound
                                ? "50%"
                                : `${40 + Math.random() * 20}% ${40 + Math.random() * 20}% ${50 + Math.random() * 10}% ${2 + Math.random() * 10}px`,
                            background: `radial-gradient(circle at 30% 25%, #FFF8DC, ${color} 70%, ${color})`,
                            boxShadow: `0 2px 6px rgba(0,0,0,0.2), inset -1px -1px 3px rgba(0,0,0,0.12)`,
                        }}
                        initial={{
                            x: 0,
                            y: 0,
                            opacity: 0,
                            scale: 0,
                            rotate: 0,
                        }}
                        animate={{
                            x: Math.cos(p.angle) * p.dist,
                            y: Math.sin(p.angle) * p.dist - 20 - Math.random() * 30,
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1.3, 1, 0.3],
                            rotate: Math.random() * 1080 - 540,
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                            duration: 0.8 + Math.random() * 0.4,
                            delay: p.delay,
                            times: [0, 0.08, 0.3, 1],
                            ease: "easeOut",
                        }}
                    />
                );
            })}
        </AnimatePresence>
    );
};

export default PopcornSplatter;
