import { type FC } from "react";

interface Props {
    questions: string[];
    onSelect: (question: string) => void;
    disabled?: boolean;
}

const ChatFollowUpChips: FC<Props> = ({ questions, onSelect, disabled }) => {
    if (questions.length === 0) return null;

    return (
        <div className="cgv-chat-chips">
            {questions.map((q) => (
                <button
                    key={q}
                    type="button"
                    className="cgv-chat-chip"
                    onClick={() => onSelect(q)}
                    disabled={disabled}
                >
                    {q}
                </button>
            ))}
        </div>
    );
};

export default ChatFollowUpChips;
