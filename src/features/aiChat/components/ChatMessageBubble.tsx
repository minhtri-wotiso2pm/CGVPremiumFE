import { type FC } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatSparkleIcon } from "@/components/ui/BrandIcons";
import type { ChatMessage } from "../types/aiChat.types";
import { messageVariants } from "./motionVariants";

interface Props {
    message: ChatMessage;
    onRetry: (messageId: string) => void;
}

const ChatMessageBubble: FC<Props> = ({ message, onRetry }) => {
    const isUser = message.role === "user";

    return (
        <motion.div
            className={`cgv-chat-msg ${isUser ? "cgv-chat-msg--user" : "cgv-chat-msg--assistant"}`}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
        >
            {!isUser && (
                <span className="cgv-chat-msg__avatar" aria-hidden="true">
                    <ChatSparkleIcon size={14} />
                </span>
            )}
            <div className="cgv-chat-msg__col">
                <div className="cgv-chat-msg__bubble">
                    {isUser ? (
                        message.content
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    )}
                </div>
                {message.failed && (
                    <button
                        type="button"
                        className="cgv-chat-msg__error"
                        onClick={() => onRetry(message.id)}
                    >
                        {message.errorReason === "rate_limit"
                            ? "Too many requests · Retry"
                            : "Failed to send · Retry"}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default ChatMessageBubble;
