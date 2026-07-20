import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAiChat } from "../hooks/useAiChat";
import { getActiveSuggestions } from "../utils/aiChat.utils";
import ChatMessageList from "../components/ChatMessageList";
import ChatFollowUpChips from "../components/ChatFollowUpChips";
import ChatInputBar from "../components/ChatInputBar";
import "../components/aiChat.css";

const BackIcon: FC<{ size?: number }> = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
);

const ResetIcon: FC<{ size?: number }> = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
    </svg>
);

const ChatPage: FC = () => {
    const navigate = useNavigate();
    const chat = useAiChat();
    const suggestions = getActiveSuggestions(chat.messages, chat.isSending);

    return (
        <div className="cgv-chat-page">
            <div className="cgv-chat-page__header">
                <button
                    type="button"
                    className="cgv-chat-page__back"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                >
                    <BackIcon />
                </button>
                <h1 className="cgv-chat-page__title">CV AI Assistant</h1>
                <button type="button" className="cgv-chat-page__reset" onClick={chat.resetConversation}>
                    <ResetIcon />
                    New conversation
                </button>
            </div>

            <div className="cgv-chat-page__container">
                <ChatMessageList messages={chat.messages} isSending={chat.isSending} onRetry={chat.retry} />

                {suggestions.length > 0 && (
                    <ChatFollowUpChips
                        questions={suggestions}
                        onSelect={chat.sendMessage}
                        disabled={chat.isSending}
                    />
                )}

                <ChatInputBar onSend={chat.sendMessage} disabled={chat.isSending} autoFocus />
            </div>
        </div>
    );
};

export default ChatPage;
