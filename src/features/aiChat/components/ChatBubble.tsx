import { useEffect, useState, type FC } from "react";
import { ChatSparkleIcon, CloseIcon } from "@/components/ui/BrandIcons";
import { AI_CHAT_INTRO_SEEN_KEY } from "../constants/aiChat.constants";

interface Props {
    isOpen: boolean;
    hasMessages: boolean;
    onToggle: () => void;
}

/** Reads (and marks) the "intro seen" flag exactly once — a lazy useState
 *  initializer, not an effect, since this is deriving initial UI state from
 *  an external synchronous source rather than reacting to a change. */
const readAndMarkIntroSeen = (): boolean => {
    try {
        if (localStorage.getItem(AI_CHAT_INTRO_SEEN_KEY)) return false;
        localStorage.setItem(AI_CHAT_INTRO_SEEN_KEY, "1");
        return true;
    } catch {
        return false;
    }
};

const ChatBubble: FC<Props> = ({ isOpen, hasMessages, onToggle }) => {
    const [showIntro, setShowIntro] = useState(() => !hasMessages && !isOpen && readAndMarkIntroSeen());

    useEffect(() => {
        if (!showIntro) return;
        const timer = setTimeout(() => setShowIntro(false), 4500);
        return () => clearTimeout(timer);
    }, [showIntro]);

    return (
        <>
            {showIntro && (
                <span className="cgv-chat-bubble__hint" role="status">
                    Ask CV's AI assistant
                </span>
            )}
            <button
                type="button"
                className="cgv-chat-bubble"
                onClick={onToggle}
                aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                {showIntro && <span className="cgv-chat-bubble__pulse" aria-hidden="true" />}
                <span className="cgv-chat-bubble__icon" aria-hidden="true">
                    {isOpen ? <CloseIcon size={22} /> : <ChatSparkleIcon size={24} />}
                </span>
            </button>
        </>
    );
};

export default ChatBubble;
