import { motion, useMotionValue } from "framer-motion";
import ChatPanel from "@/features/aiChat/components/ChatPanel";
import { useAiChat } from "@/features/aiChat/hooks/useAiChat";
import Sigil from "./Sigil";

/* ══════════════════════════════════════════════════════════════
   ChatLauncher (docked view) — reuses the production chat panel and
   perches a calm, resting Kino on its top edge (eyes closed — no
   data-awake — so it reads as a companion quietly keeping you company
   through the whole conversation).
══════════════════════════════════════════════════════════════ */

interface Props {
    onClose: () => void;
}

export default function MascotChatDock({ onClose }: Props) {
    const chat = useAiChat();
    const zeroX = useMotionValue(0);
    const zeroY = useMotionValue(0);

    return (
        <>
            <motion.div
                className="fa-dock-sleeper"
                aria-hidden="true"
                initial={{ opacity: 0, y: 24, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: -5 }}
                exit={{ opacity: 0, y: 16, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.1 }}
            >
                <Sigil pupilX={zeroX} pupilY={zeroY} idSuffix="dock" />
            </motion.div>
            <ChatPanel chat={chat} onClose={onClose} />
        </>
    );
}
