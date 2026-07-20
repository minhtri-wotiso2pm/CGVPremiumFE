import { useEffect, useRef, type FC } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { ChatSparkleIcon, ExpandIcon, CloseIcon } from "@/components/ui/BrandIcons";
import { useAiChat } from "../hooks/useAiChat";
import { getActiveSuggestions } from "../utils/aiChat.utils";
import ChatMessageList from "./ChatMessageList";
import ChatFollowUpChips from "./ChatFollowUpChips";
import ChatInputBar from "./ChatInputBar";
import { panelVariants } from "./motionVariants";

interface Props {
    chat: ReturnType<typeof useAiChat>;
    onClose: () => void;
}

const ChatPanel: FC<Props> = ({ chat, onClose }) => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleExpand = () => {
        onClose();
        navigate(user ? "/customer/chat" : "/chat");
    };

    const suggestions = getActiveSuggestions(chat.messages, chat.isSending);

    return (
        <motion.div
            ref={panelRef}
            className="cgv-chat-panel"
            role="dialog"
            aria-modal="false"
            aria-label="CGV AI Assistant"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="cgv-chat-panel__header">
                <span className="cgv-chat-panel__avatar" aria-hidden="true">
                    <ChatSparkleIcon size={17} />
                </span>
                <div className="cgv-chat-panel__title-block">
                    <p className="cgv-chat-panel__title">CV AI Assistant</p>
                    <span className="cgv-chat-panel__status">
                        <span className="cgv-chat-panel__status-dot" aria-hidden="true" />
                        Online
                    </span>
                </div>
                <div className="cgv-chat-panel__actions">
                    <button
                        type="button"
                        className="cgv-chat-icon-btn"
                        onClick={handleExpand}
                        aria-label="Expand to full screen"
                        title="Expand to full screen"
                    >
                        <ExpandIcon size={15} />
                    </button>
                    <button
                        type="button"
                        className="cgv-chat-icon-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <CloseIcon size={15} />
                    </button>
                </div>
            </div>

            <ChatMessageList messages={chat.messages} isSending={chat.isSending} onRetry={chat.retry} />

            {suggestions.length > 0 && (
                <ChatFollowUpChips
                    questions={suggestions}
                    onSelect={chat.sendMessage}
                    disabled={chat.isSending}
                />
            )}

            <ChatInputBar onSend={chat.sendMessage} disabled={chat.isSending} autoFocus />
        </motion.div>
    );
};

export default ChatPanel;
