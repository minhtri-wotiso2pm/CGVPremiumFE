import { useEffect, useRef, useState, type FC } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAiChat } from "../hooks/useAiChat";
import { useFunnyMode } from "@/features/funnyAssistant/hooks/useFunnyMode";
import MascotStage from "@/features/funnyAssistant/components/MascotStage";
import ChatBubble from "./ChatBubble";
import ChatPanel from "./ChatPanel";
import "./aiChat.css";

const CHAT_PAGE_PATHS = new Set(["/chat", "/customer/chat"]);

/** Owns the actual `useAiChat()` instance — kept as a separate component
 *  (rather than an early return after the hook call) so it fully unmounts
 *  while the dedicated full-page route is active. That's what makes the
 *  session continue correctly: on remount, `useAiChat` re-reads
 *  sessionStorage and picks up whatever sessionId/messages the full page
 *  just persisted, instead of resuming a stale in-memory copy from before
 *  the navigation. */
const ChatWidgetInner: FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const chat = useAiChat();
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (wrapRef.current && !wrapRef.current.contains(target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    return (
        <div ref={wrapRef}>
            <ChatBubble
                isOpen={isOpen}
                hasMessages={chat.messages.length > 0}
                onToggle={() => setIsOpen((v) => !v)}
            />
            <AnimatePresence>
                {isOpen && <ChatPanel chat={chat} onClose={() => setIsOpen(false)} />}
            </AnimatePresence>
        </div>
    );
};

const ChatWidget: FC = () => {
    const location = useLocation();
    // FunnyModeManager decision point: when a VIP on desktop has opted into
    // Funny mode, the whole floating bubble is replaced by the living mascot.
    // Otherwise the classic bubble renders exactly as before.
    const funny = useFunnyMode();

    // Hidden on the dedicated full-page chat route — avoids a duplicate
    // floating bubble sitting on top of the same conversation, and unmounts
    // ChatWidgetInner so its useAiChat() instance doesn't go stale.
    if (CHAT_PAGE_PATHS.has(location.pathname)) return null;

    if (funny.enabled) return <MascotStage />;

    return <ChatWidgetInner />;
};

export default ChatWidget;
