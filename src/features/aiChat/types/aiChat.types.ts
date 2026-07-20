export interface ChatRequest {
    message: string;
    sessionId?: string;
}

export interface ChatResponse {
    success: boolean;
    reply: string;
    sessionId: string;
    followUpQuestions: string[];
}

export type ChatErrorReason = "rate_limit" | "network";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    followUpQuestions?: string[];
    /** Set on a `role: "user"` message when its send attempt failed — drives the inline retry affordance. */
    failed?: boolean;
    errorReason?: ChatErrorReason;
}

/** Shape persisted to sessionStorage — the single source of truth shared between the mini panel and the full page. */
export interface ChatPersistedState {
    sessionId: string | null;
    messages: ChatMessage[];
    lastActivityAt: number;
}
