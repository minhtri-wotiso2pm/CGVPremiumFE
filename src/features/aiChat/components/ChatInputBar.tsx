import { useRef, useState, type FC, type KeyboardEvent } from "react";
import { SendIcon } from "@/components/ui/BrandIcons";
import { AI_CHAT_MAX_LENGTH } from "../constants/aiChat.constants";

interface Props {
    onSend: (text: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
}

const ChatInputBar: FC<Props> = ({ onSend, disabled, autoFocus }) => {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const grow = (el: HTMLTextAreaElement) => {
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    };

    const handleSend = () => {
        const text = value.trim();
        if (!text || disabled) return;
        onSend(text);
        setValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const remaining = AI_CHAT_MAX_LENGTH - value.length;

    return (
        <div className="cgv-chat-input-bar">
            <textarea
                ref={textareaRef}
                className="cgv-chat-input-bar__textarea"
                rows={1}
                placeholder="Type your question…"
                value={value}
                maxLength={AI_CHAT_MAX_LENGTH}
                autoFocus={autoFocus}
                disabled={disabled}
                onChange={(e) => {
                    setValue(e.target.value);
                    grow(e.target);
                }}
                onKeyDown={handleKeyDown}
                aria-label="Ask the AI assistant"
            />
            {remaining <= 200 && (
                <span className="cgv-chat-input-bar__counter">{remaining}</span>
            )}
            <button
                type="button"
                className="cgv-chat-input-bar__send"
                onClick={handleSend}
                disabled={disabled || value.trim().length === 0}
                aria-label="Send message"
            >
                <SendIcon size={15} />
            </button>
        </div>
    );
};

export default ChatInputBar;
