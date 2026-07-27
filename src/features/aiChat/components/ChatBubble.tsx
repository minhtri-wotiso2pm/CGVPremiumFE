import { useEffect, useState, useCallback, useRef, useMemo, type FC } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { AI_CHAT_INTRO_SEEN_KEY } from "../constants/aiChat.constants";
import svgDefault from "@/assets/live_chatbot.svg?raw";
import svgHappy from "@/assets/live_chatbot_happy.svg?raw";
import svgPondering from "@/assets/live_chatbot_pondering.svg?raw";
import svgSleepy from "@/assets/live_chatbot_sleepy.svg?raw";

const PARTICLE_COLORS = ["#E8001C", "#f59e0b", "#ffffff", "#b50016"];

type BotSvgVariant = "default" | "happy" | "pondering" | "sleepy";

const SVG_MAP: Record<BotSvgVariant, string> = {
    default: svgDefault,
    happy: svgHappy,
    pondering: svgPondering,
    sleepy: svgSleepy,
};

const HAPPY_DURATION_MS = 3000;
const IDLE_TIMEOUT_MS = 20000;

interface Particle {
    id: number;
    angle: number;
    distance: number;
    size: number;
    color: string;
    shape: "circle" | "square";
    delay: number;
    duration: number;
}

interface Props {
    isOpen: boolean;
    hasMessages: boolean;
    onToggle: () => void;
    onHappy?: () => void;
    animTrigger?: number;
    isBotTyping?: boolean;
    happyTrigger?: number;
    isUserTyping?: boolean;
}

const readAndMarkIntroSeen = (): boolean => {
    try {
        if (localStorage.getItem(AI_CHAT_INTRO_SEEN_KEY)) return false;
        localStorage.setItem(AI_CHAT_INTRO_SEEN_KEY, "1");
        return true;
    } catch {
        return false;
    }
};

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

const ChatBubble: FC<Props> = ({
    isOpen,
    hasMessages,
    onToggle,
    onHappy,
    animTrigger = 0,
    isBotTyping = false,
    happyTrigger = 0,
    isUserTyping = false,
}) => {
    const [showIntro, setShowIntro] = useState(() => !hasMessages && !isOpen && readAndMarkIntroSeen());
    const [particles, setParticles] = useState<Particle[] | null>(null);
    const [burstKey, setBurstKey] = useState(0);
    const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const faceRef = useRef<HTMLDivElement>(null);
    const didDrag = useRef(false);
    const snapRight = useRef(true);
    const animPlayedForOpen = useRef(false);
    const prevAnimTrigger = useRef(animTrigger);
    const prevHasMessages = useRef(hasMessages);
    const [hasUnread, setHasUnread] = useState(false);

    const [botVariant, setBotVariant] = useState<BotSvgVariant>("default");
    const prevBotVariant = useRef<BotSvgVariant>("default");
    const happyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const prevHappyTrigger = useRef(happyTrigger);
    const svgRef = useRef<HTMLDivElement>(null);
    const isClosingRef = useRef(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const currentSvgRaw = useMemo(() => SVG_MAP[botVariant], [botVariant]);

    useEffect(() => {
        if (isClosingRef.current) return;
        const svgEl = svgRef.current;
        if (!svgEl) return;
        if (svgEl.innerHTML !== currentSvgRaw) {
            svgEl.innerHTML = currentSvgRaw;
        }
    }, [currentSvgRaw]);

    useEffect(() => {
        if (!showIntro) return;
        const timer = setTimeout(() => setShowIntro(false), 4500);
        return () => clearTimeout(timer);
    }, [showIntro]);

    useEffect(() => {
        if (!isOpen) {
            isClosingRef.current = true;
            animPlayedForOpen.current = false;
            clearTimeout(happyTimer.current);
            clearTimeout(idleTimer.current);
            setBotVariant("default");
        } else {
            isClosingRef.current = false;
        }
    }, [isOpen]);

    useEffect(() => {
        if (animTrigger !== prevAnimTrigger.current) {
            prevAnimTrigger.current = animTrigger;
            if (isOpen && !animPlayedForOpen.current) {
                animPlayedForOpen.current = true;
            }
        }
    }, [animTrigger, isOpen]);

    useEffect(() => {
        if (hasMessages && !prevHasMessages.current && !isOpen) setHasUnread(true);
        if (isOpen) setHasUnread(false);
        prevHasMessages.current = hasMessages;
    }, [hasMessages, isOpen]);

    const resetIdleTimer = useCallback(() => {
        clearTimeout(idleTimer.current);
        if (!isOpen || isBotTyping || isUserTyping) return;
        idleTimer.current = setTimeout(() => {
            setBotVariant("sleepy");
        }, IDLE_TIMEOUT_MS);
    }, [isOpen, isBotTyping, isUserTyping]);

    useEffect(() => {
        resetIdleTimer();
        return () => clearTimeout(idleTimer.current);
    }, [resetIdleTimer]);

    useEffect(() => {
        if (!isOpen) return;
        const onActivity = () => resetIdleTimer();
        document.addEventListener("mousemove", onActivity);
        document.addEventListener("keydown", onActivity);
        document.addEventListener("click", onActivity);
        return () => {
            document.removeEventListener("mousemove", onActivity);
            document.removeEventListener("keydown", onActivity);
            document.removeEventListener("click", onActivity);
        };
    }, [isOpen, resetIdleTimer]);

    useEffect(() => {
        if (botVariant !== prevBotVariant.current) {
            prevBotVariant.current = botVariant;
        }
    }, [botVariant]);

    useEffect(() => {
        if (happyTrigger !== prevHappyTrigger.current) {
            prevHappyTrigger.current = happyTrigger;
            if (happyTrigger > 0) {
                clearTimeout(happyTimer.current);
                clearTimeout(idleTimer.current);
                setBotVariant("happy");
                happyTimer.current = setTimeout(() => {
                    setBotVariant("default");
                    resetIdleTimer();
                }, HAPPY_DURATION_MS);
            }
        }
    }, [happyTrigger, resetIdleTimer]);

    useEffect(() => {
        if (isBotTyping || isUserTyping) {
            clearTimeout(happyTimer.current);
            clearTimeout(idleTimer.current);
            setBotVariant("pondering");
        } else if (botVariant === "pondering") {
            setBotVariant("default");
            resetIdleTimer();
        }
    }, [isBotTyping, isUserTyping, botVariant, resetIdleTimer]);

    useEffect(() => {
        const handleResize = () => {
            const el = buttonRef.current;
            if (!el) return;
            const vw = window.innerWidth;
            x.set(snapRight.current ? 0 : el.getBoundingClientRect().width + 48 - vw);
            y.set(0);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [x, y]);

    useEffect(() => {
        const face = faceRef.current;
        if (!face) return;

        let rafId: number;
        let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

        const onMouseMove = (e: MouseEvent) => {
            const rect = face.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const maxDist = Math.max(rect.width, rect.height) * 2;
            const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / maxDist));
            const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / maxDist));
            targetX = nx * 6;
            targetY = ny * 6;
        };

        const tick = () => {
            currentX += (targetX - currentX) * 0.1;
            currentY += (targetY - currentY) * 0.1;
            if (Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
                face.style.transform = `translate(${currentX}px, ${currentY}px)`;
            } else if (face.style.transform) {
                face.style.transform = "";
            }
            rafId = requestAnimationFrame(tick);
        };

        document.addEventListener("mousemove", onMouseMove);
        rafId = requestAnimationFrame(tick);

        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            cancelAnimationFrame(rafId);
            face.style.transform = "";
        };
    }, []);

    const emitParticles = useCallback(() => {
        const el = buttonRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const count = 18;

        setParticles(Array.from({ length: count }, (_, i) => ({
            id: i,
            angle: (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4,
            distance: 50 + Math.random() * 120,
            size: 3 + Math.random() * 7,
            color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
            shape: Math.random() > 0.5 ? "circle" : "square",
            delay: Math.random() * 0.06,
            duration: 0.45 + Math.random() * 0.35,
        })));
        setParticleOrigin({ x: cx, y: cy });
        setBurstKey((k) => k + 1);
    }, []);

    const handleDragEnd = useCallback(() => {
        const el = buttonRef.current;
        if (!el) return;

        const viewportW = window.innerWidth;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;

        if (centerX < viewportW / 2) {
            animate(x, rect.width + 48 - viewportW, SPRING);
            snapRight.current = false;
        } else {
            animate(x, 0, SPRING);
            snapRight.current = true;
        }
        animate(y, 0, SPRING);
    }, [x, y]);

    const handleTap = useCallback(() => {
        if (didDrag.current) { didDrag.current = false; return; }
        const opening = !isOpen;
        onToggle();
        if (opening) {
            onHappy?.();
            if (!animPlayedForOpen.current) {
                animPlayedForOpen.current = true;
                emitParticles();
            }
        }
    }, [isOpen, emitParticles, onToggle, onHappy]);

    return (
        <>
            {showIntro && (
                <span className="cgv-chat-bubble__hint" role="status">
                    Ask CV's AI assistant
                </span>
            )}
            <motion.button
                ref={buttonRef}
                type="button"
                className={`cgv-chat-bubble${botVariant === "pondering" && !isOpen ? " cgv-chat-bubble--typing" : ""}`}
                style={{ x, y }}
                drag
                dragMomentum={false}
                onDragStart={() => { didDrag.current = true; }}
                onDragEnd={handleDragEnd}
                whileHover={{ scale: 1.08 }}
                whileTap={isOpen ? undefined : { scale: 0.95 }}
                onTap={handleTap}
                aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <span className="cgv-chat-bubble__wrap">
                    {hasUnread && !isOpen && (
                        <span className="cgv-chat-bubble__badge" aria-label="New messages" />
                    )}
                    <span className="cgv-chat-bubble__glow" aria-hidden="true" />
                    <span className="cgv-chat-bubble__body">
                        <div ref={faceRef} className="cgv-chat-bubble__face">
                            <div
                                ref={svgRef}
                                className="cgv-chat-bubble__svg"
                                aria-hidden="true"
                            />
                        </div>
                    </span>
                </span>
            </motion.button>
            {particles && (
                <div className="cgv-chat-particles" aria-hidden="true" key={burstKey}>
                    {particles.map((p) => {
                        const dx = Math.cos(p.angle) * p.distance;
                        const dy = Math.sin(p.angle) * p.distance;
                        return (
                            <motion.span
                                key={p.id}
                                className={`cgv-chat-particle cgv-chat-particle--${p.shape}`}
                                style={{
                                    width: p.size,
                                    height: p.size,
                                    backgroundColor: p.color,
                                    left: particleOrigin.x,
                                    top: particleOrigin.y,
                                }}
                                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                                animate={{ opacity: 0, scale: 1, x: dx, y: dy }}
                                transition={{
                                    duration: p.duration,
                                    delay: p.delay,
                                    ease: "easeOut",
                                }}
                                onAnimationComplete={() => {
                                    if (p.id === particles.length - 1) setParticles(null);
                                }}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default ChatBubble;
