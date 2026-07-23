import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useKinoMachine } from "../engine/useKinoMachine";
import { useCursorTracking } from "../engine/useCursorTracking";
import { useKinoSound } from "../engine/useKinoSound";
import { usePageVisible } from "../hooks/useEnvironment";
import { funnyModeStore, useFunnySettings, useKinoAmbient } from "../store/funnyModeStore";
import { resolveEquipped } from "../data/outfits";
import Sigil from "./Sigil";
import MascotChatDock from "./MascotChatDock";
import "../funnyAssistant.css";

/* ══════════════════════════════════════════════════════════════
   MascotStage — the orchestrator for Kino, the Living Sigil.

     dormant ⇄ aware (cursor)  →  wake → present → engaged (chat)
                                              ↑ click / Enter
     chat close → folding → dormant
     first-visit-of-day → a one-shot greet beat
     app intent (booking success) → a celebrate beat (+ milestone bump)

   No roaming, no catch-to-open game: the chat opens on a single click.
   P2: tone drives brightness/breath (data-tone), a gentle night warmth
   (data-warm), opt-in SFX, and an optional ambient tint.
   P3: the equipped, unlocked outfit renders in character states.
══════════════════════════════════════════════════════════════ */

const SIGNATURE = { type: "spring", stiffness: 210, damping: 24, mass: 0.9 } as const;
const GREET_KEY = "cgv-kino-greeted"; // YYYY-MM-DD of the last greeting

const todayStamp = () => new Date().toISOString().slice(0, 10);
const isNight = () => {
    const h = new Date().getHours();
    return h >= 19 || h < 6;
};

function shouldGreetToday(): boolean {
    try {
        return localStorage.getItem(GREET_KEY) !== todayStamp();
    } catch {
        return false;
    }
}
function markGreetedToday() {
    try {
        localStorage.setItem(GREET_KEY, todayStamp());
    } catch {
        /* private mode — greeting simply repeats next load, harmless */
    }
}

export default function MascotStage() {
    const reduced = Boolean(useReducedMotion());
    const pageVisible = usePageVisible();
    const { sound, equipped, celebrations } = useFunnySettings();
    const ambient = useKinoAmbient();
    const playSound = useKinoSound(sound);

    const {
        frame,
        toAware,
        leaveAware,
        wakeToPresent,
        foldToDormant,
        goEngaged,
        goDormant,
        playGesture,
    } = useKinoMachine();

    const [chatOpen, setChatOpen] = useState(false);
    const chatOpenRef = useRef(false);
    useEffect(() => {
        chatOpenRef.current = chatOpen;
    }, [chatOpen]);

    const [warm] = useState(isNight);
    const mascotRef = useRef<HTMLDivElement>(null);

    // Kino only mounts for VIPs (gated upstream), so isVip is implicitly true.
    const outfit = useMemo(
        () => resolveEquipped(equipped, { isVip: true, celebrations, now: new Date() }),
        [equipped, celebrations],
    );

    // Head centre in viewport px — feeds pupil tracking + proximity.
    const getHeadCenter = useCallback(() => {
        const el = mascotRef.current;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height * 0.45 };
    }, []);

    const handleCursorEnter = useCallback(() => {
        if (chatOpenRef.current) return;
        toAware();
    }, [toAware]);

    const handleCursorLeave = useCallback(() => {
        if (chatOpenRef.current) return;
        leaveAware();
    }, [leaveAware]);

    const cursor = useCursorTracking({
        enabled: pageVisible && !chatOpen,
        getHeadCenter,
        onEnter: handleCursorEnter,
        onLeave: handleCursorLeave,
    });

    // One click → wake → open chat. Instant, no game.
    const openChat = useCallback(async () => {
        if (chatOpenRef.current) return;
        playSound("chat");
        if (reduced) {
            goEngaged();
            setChatOpen(true);
            return;
        }
        await wakeToPresent();
        goEngaged();
        setChatOpen(true);
    }, [wakeToPresent, goEngaged, reduced, playSound]);

    const closeChat = useCallback(async () => {
        setChatOpen(false);
        if (reduced) {
            goDormant();
            return;
        }
        await foldToDormant();
    }, [foldToDormant, goDormant, reduced]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void openChat();
            }
        },
        [openChat],
    );

    // First-visit-of-day greet + the app intent bus (celebrate / nudge).
    useEffect(() => {
        if (!reduced && shouldGreetToday()) {
            markGreetedToday();
            playSound("wake");
            void playGesture("greet");
        }
        const unsub = funnyModeStore.subscribeIntents((intent) => {
            if (chatOpenRef.current || reduced) return;
            if (intent === "celebrate") {
                funnyModeStore.recordCelebration();
                playSound("celebrate");
            } else {
                playSound("wake");
            }
            void playGesture(intent);
        });
        return unsub;
    }, [playGesture, reduced, playSound]);

    const st = frame.state;
    const awake = st === "waking" || st === "present" || st === "gesturing" || st === "engaged";
    const lit = awake || st === "aware";
    const scale = awake ? 1.06 : st === "aware" ? 1.03 : 1;

    const wrapStyle: CSSProperties | undefined = ambient
        ? ({ ["--k-core"]: `color-mix(in oklab, var(--cgv-crimson, #e8001c) 68%, ${ambient})` } as CSSProperties)
        : undefined;

    return (
        <div className="fa-kino" style={wrapStyle}>
            <div className="fa-stage">
                <AnimatePresence>
                    {!chatOpen && st !== "hidden" && (
                        <motion.div
                            ref={mascotRef}
                            className="fa-mascot"
                            data-awake={awake}
                            data-lit={lit}
                            data-tone={frame.tone}
                            data-warm={warm}
                            data-paused={!pageVisible}
                            onClick={() => void openChat()}
                            onKeyDown={handleKeyDown}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale }}
                            exit={{ opacity: 0, scale: 0.4 }}
                            transition={SIGNATURE}
                            role="button"
                            tabIndex={0}
                            aria-label="Trợ lý CGV — chạm để trò chuyện"
                        >
                            <Sigil
                                pupilX={cursor.pupilX}
                                pupilY={cursor.pupilY}
                                outfit={awake ? outfit : null}
                            />
                            <AnimatePresence>
                                {st === "gesturing" && !reduced && (
                                    <motion.span
                                        className="fa-bloom"
                                        initial={{ scale: 0.2, opacity: 0.85 }}
                                        animate={{ scale: 2.6, opacity: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Keyboard / screen-reader path — opens chat without any pointer play. */}
            <button type="button" className="fa-sr-open" onClick={() => void openChat()}>
                Open CGV assistant chat
            </button>

            <AnimatePresence>
                {chatOpen && <MascotChatDock key="dock" onClose={closeChat} />}
            </AnimatePresence>
        </div>
    );
}
