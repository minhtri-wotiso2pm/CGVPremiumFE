import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAiChat } from "../hooks/useAiChat";
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
    const [animTrigger, setAnimTrigger] = useState(0);
    const [happyTrigger, setHappyTrigger] = useState(0);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const chat = useAiChat();
    const wrapRef = useRef<HTMLDivElement>(null);
    const prevMsgLen = useRef(chat.messages.length);
    const typingTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    const triggerHappy = useCallback(() => setHappyTrigger(t => t + 1), []);

    useEffect(() => {
        if (chat.messages.length > prevMsgLen.current) {
            prevMsgLen.current = chat.messages.length;
            setAnimTrigger((t) => t + 1);
        }
    }, [chat.messages.length]);

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

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if ((target.tagName === "INPUT" || target.tagName === "TEXTAREA") && wrap.contains(target)) {
                setIsUserTyping(true);
                clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => setIsUserTyping(false), 1000);
            }
        };
        wrap.addEventListener("keydown", onKey);
        return () => {
            wrap.removeEventListener("keydown", onKey);
            clearTimeout(typingTimeout.current);
        };
    }, []);

    return (
        <div ref={wrapRef}>
            <ChatBubble
                isOpen={isOpen}
                hasMessages={chat.messages.length > 0}
                onToggle={() => setIsOpen((v) => !v)}
                onHappy={triggerHappy}
                animTrigger={animTrigger}
                isBotTyping={chat.isSending}
                happyTrigger={happyTrigger}
                isUserTyping={isUserTyping}
            />
            <AnimatePresence>
                {isOpen && <ChatPanel chat={chat} onClose={() => setIsOpen(false)} onHappy={triggerHappy} />}
            </AnimatePresence>
        </div>
    );
};

const ChatWidget: FC = () => {
    const location = useLocation();

    // Hidden on the dedicated full-page chat route — avoids a duplicate
    // floating bubble sitting on top of the same conversation, and unmounts
    // ChatWidgetInner so its useAiChat() instance doesn't go stale.
    if (CHAT_PAGE_PATHS.has(location.pathname)) return null;

    return <ChatWidgetInner />;
};

export default ChatWidget;
