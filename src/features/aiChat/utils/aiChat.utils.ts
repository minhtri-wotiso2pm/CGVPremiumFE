import type { ChatMessage, ChatPersistedState } from "../types/aiChat.types";
import { AI_CHAT_STORAGE_KEY, AI_CHAT_SESSION_TTL_MS, AI_CHAT_STARTER_QUESTIONS } from "../constants/aiChat.constants";

export const genMessageId = (): string =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Reads persisted conversation state, discarding it if the BE's 30-min
 *  inactivity window has already elapsed (so the FE doesn't resume a
 *  conversation the server no longer remembers). */
export const loadChatState = (): ChatPersistedState | null => {
    try {
        const raw = sessionStorage.getItem(AI_CHAT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ChatPersistedState;
        if (Date.now() - parsed.lastActivityAt > AI_CHAT_SESSION_TTL_MS) return null;
        return parsed;
    } catch {
        return null;
    }
};

export const saveChatState = (state: ChatPersistedState): void => {
    try {
        sessionStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(state));
    } catch {
        // sessionStorage unavailable (private mode, quota) — conversation just won't persist across navigation
    }
};

export const clearChatState = (): void => {
    try {
        sessionStorage.removeItem(AI_CHAT_STORAGE_KEY);
    } catch {
        // ignore
    }
};

/** The suggestion chips pinned above the input bar: default starters before
 *  the first message, then whatever follow-ups came back with the latest
 *  reply — hidden while a request is in flight or the last message is a
 *  failed/unanswered user message. */
export const getActiveSuggestions = (messages: ChatMessage[], isSending: boolean): string[] => {
    if (isSending) return [];
    if (messages.length === 0) return AI_CHAT_STARTER_QUESTIONS;
    const last = messages[messages.length - 1];
    if (last.role === "assistant" && last.followUpQuestions && last.followUpQuestions.length > 0) {
        return last.followUpQuestions;
    }
    return [];
};
