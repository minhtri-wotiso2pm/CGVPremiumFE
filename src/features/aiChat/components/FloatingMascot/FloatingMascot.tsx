import { useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { useMascotState } from "./hooks/useMascotState";
import MascotShadow from "./body/MascotShadow";
import MascotLegs from "./body/MascotLegs";
import MascotBody from "./body/MascotBody";
import MascotFace from "./body/MascotFace";
import MascotPopcorn from "./body/MascotPopcorn";
import MascotArms from "./body/MascotArms";
import MascotZzz from "./body/MascotZzz";
import PopcornSplatter from "./body/PopcornSplatter";
import { containerVariants } from "./animations/variants";
import { AI_CHAT_INTRO_SEEN_KEY } from "../../constants/aiChat.constants";
import type { AnimationPlaybackControls } from "framer-motion";
import "./FloatingMascot.css";

const POS_KEY = "cgv_mascot_pos";

interface Props {
    isOpen: boolean;
    hasMessages: boolean;
    onToggle: () => void;
    isSending?: boolean;
    lastMessageFailed?: boolean;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const loadPos = (): { x: number; y: number } | null => {
    try {
        const raw = localStorage.getItem(POS_KEY);
        return raw ? (JSON.parse(raw) as { x: number; y: number }) : null;
    } catch {
        return null;
    }
};

const savePos = (x: number, _y: number) => {
    try {
        localStorage.setItem(POS_KEY, JSON.stringify({ x, y: _y }));
    } catch {
        /* noop */
    }
};

const getDims = (w?: number) => {
    const ww = w ?? window.innerWidth;
    const isMobile = ww <= 480;
    return { btnW: isMobile ? 50 : 75, gap: isMobile ? 16 : 24, ww };
};

const getBottomY = (): number => {
    const d = getDims();
    return window.innerHeight - Math.round((d.btnW * 320) / 200) - d.gap;
};

const getRandomX = (): number => {
    const d = getDims();
    const maxX = d.ww - d.btnW - d.gap;
    return d.gap + Math.random() * (maxX - d.gap);
};

const getDefaultPos = (): { x: number; y: number } => {
    const d = getDims();
    return { x: d.ww - d.btnW - d.gap, y: getBottomY() };
};

const clampPos = (x: number, y: number): { x: number; y: number } => {
    const d = getDims();
    const btnH = Math.round((d.btnW * 320) / 200);
    const maxX = d.ww - d.btnW - d.gap;
    const maxY = window.innerHeight - btnH - d.gap;
    return {
        x: Math.max(d.gap, Math.min(x, maxX)),
        y: Math.max(d.gap, Math.min(y, maxY)),
    };
};

const FloatingMascot: FC<Props> = ({
    isOpen,
    hasMessages,
    onToggle,
    isSending,
    lastMessageFailed,
}) => {
    const { state, setState, handleMouseEnter, handleMouseLeave, handleClick, updateAiState, touchActivity } =
        useMascotState();

    const [showIntro, setShowIntro] = useState(() => {
        if (hasMessages || isOpen) return false;
        try {
            if (localStorage.getItem(AI_CHAT_INTRO_SEEN_KEY)) return false;
            localStorage.setItem(AI_CHAT_INTRO_SEEN_KEY, "1");
            return true;
        } catch {
            return false;
        }
    });

    const savedPos = useMemo(() => loadPos(), []);
    const x = useMotionValue(savedPos?.x ?? getDefaultPos().x);
    const y = useMotionValue(getDefaultPos().y);

    const fallControlsRef = useRef<AnimationPlaybackControls | null>(null);
    const roamControlsRef = useRef<AnimationPlaybackControls | null>(null);
    const wasDraggedRef = useRef(false);
    const stateRef = useRef(state);
    stateRef.current = state;
    const prevIsSendingRef = useRef(isSending);

    /* ── Splatter burst counter ─────────────────────────────────── */

    const [burstKey, setBurstKey] = useState(0);

    const triggerSplatter = useCallback(() => {
        setBurstKey((k) => k + 1);
    }, []);

    /* ── AI state bridge ───────────────────────────────────────── */

    useEffect(() => {
        if (isSending === undefined || lastMessageFailed === undefined) return;
        const wasSending = prevIsSendingRef.current;
        prevIsSendingRef.current = isSending;
        updateAiState(isSending, lastMessageFailed);
    }, [isSending, lastMessageFailed, updateAiState]);

    /* ── Roaming ───────────────────────────────────────────────── */

    useEffect(() => {
        if (state !== "roaming") {
            roamControlsRef.current?.stop();
            roamControlsRef.current = null;
            return;
        }

        let cancelled = false;

        const roam = async () => {
            while (!cancelled) {
                const c = animate(x, getRandomX(), {
                    duration: 3,
                    ease: "easeInOut",
                });
                roamControlsRef.current = c;
                await c;
                if (cancelled) return;
                await sleep(2000 + Math.random() * 3000);
            }
        };

        roam();

        return () => {
            cancelled = true;
            roamControlsRef.current?.stop();
        };
    }, [state]);

    /* ── Intro hint timer ──────────────────────────────────────── */

    useEffect(() => {
        if (!showIntro) return;
        const timer = setTimeout(() => setShowIntro(false), 4500);
        return () => clearTimeout(timer);
    }, [showIntro]);

    /* ── Resize ────────────────────────────────────────────────── */

    useEffect(() => {
        const handleResize = () => {
            const { x: cx, y: cy } = clampPos(x.get(), y.get());
            x.set(cx);
            y.set(cy);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /* ── Drag handlers ─────────────────────────────────────────── */

    const handleDragStart = useCallback(() => {
        wasDraggedRef.current = true;
        fallControlsRef.current?.stop();
        fallControlsRef.current = null;
        roamControlsRef.current?.stop();
        roamControlsRef.current = null;
        setState("idle");
        touchActivity();
    }, [touchActivity, setState]);

    const handleDragEnd = useCallback(() => {
        savePos(x.get(), getBottomY());
        const bottomY = getBottomY();
        const currentY = y.get();

        /* Burst on release */
        triggerSplatter();

        /* Heavy fall: fast to bottom + bounce */
        const fallAnim = animate(y, [currentY, bottomY + 15, bottomY - 6, bottomY], {
            duration: 0.55,
            ease: ["easeIn", "easeOut", "easeOut"],
        });
        fallControlsRef.current = fallAnim;

        /* 2nd burst at impact (approx when first bounce hits bottomY+15) */
        setTimeout(() => triggerSplatter(), 160);

        fallAnim.then(() => {
            fallControlsRef.current = null;
            triggerSplatter();
            setState("landing");
        });
    }, [setState, triggerSplatter]);

    /* ── Click handler override ────────────────────────────────── */

    const handleButtonClick = useCallback(() => {
        if (wasDraggedRef.current) {
            wasDraggedRef.current = false;
            return;
        }
        triggerSplatter();
        handleClick();
        onToggle();
    }, [handleClick, onToggle, triggerSplatter]);

    /* ── prefers-reduced-motion ────────────────────────────────── */

    const reduced = useMemo(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        [],
    );

    return (
        <motion.div
            drag={!reduced}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="cgv-floating-mascot-shell"
            style={{ x, y }}
        >
            {showIntro && (
                <span className="cgv-floating-mascot__hint" role="status">
                    Ask CV's AI assistant
                </span>
            )}
            <button
                type="button"
                className="cgv-floating-mascot"
                onClick={handleButtonClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <motion.svg
                    viewBox="0 0 200 320"
                    className="cgv-floating-mascot__svg"
                    aria-hidden="true"
                    variants={containerVariants}
                    animate={reduced ? "idle" : state}
                >
                    <MascotShadow />
                    <MascotLegs />
                    <MascotBody state={state} />
                    <MascotFace state={state} />
                    <MascotPopcorn state={state} />
                    <MascotArms state={state} />
                    <MascotZzz state={state} />
                </motion.svg>
                <PopcornSplatter burstKey={burstKey} />
            </button>
        </motion.div>
    );
};

export default FloatingMascot;
