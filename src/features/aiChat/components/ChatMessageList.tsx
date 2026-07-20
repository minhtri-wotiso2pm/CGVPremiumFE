import { useEffect, useRef, type FC } from "react";
import { ChatSparkleIcon } from "@/components/ui/BrandIcons";
import type { ChatMessage } from "../types/aiChat.types";
import { AI_CHAT_GREETING } from "../constants/aiChat.constants";
import ChatMessageBubble from "./ChatMessageBubble";

interface Props {
    messages: ChatMessage[];
    isSending: boolean;
    onRetry: (messageId: string) => void;
}

const ChatMessageList: FC<Props> = ({ messages, isSending, onRetry }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages.length, isSending]);

    if (messages.length === 0) {
        return (
            <div className="cgv-chat-body" aria-live="polite">
                <div className="cgv-chat-empty">
                    <span className="cgv-chat-empty__avatar" aria-hidden="true">
                        <ChatSparkleIcon size={24} />
                    </span>
                    <p className="cgv-chat-empty__text">{AI_CHAT_GREETING}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cgv-chat-body" aria-live="polite">
            {messages.map((m) => (
                <ChatMessageBubble key={m.id} message={m} onRetry={onRetry} />
            ))}
            {isSending && (
                <div className="cgv-chat-typing" aria-label="Assistant is typing">
                    <span />
                    <span />
                    <span />
                </div>
            )}
            <div ref={endRef} />
        </div>
    );
};

export default ChatMessageList;
