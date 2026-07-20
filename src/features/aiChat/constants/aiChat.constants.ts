export const AI_CHAT_STORAGE_KEY = "cgv_ai_chat_state";
export const AI_CHAT_INTRO_SEEN_KEY = "cgv_ai_chat_intro_seen";

export const AI_CHAT_MAX_LENGTH = 2000;
/** Mirrors the backend's 30-minute inactivity session expiry — used so the FE
 *  never keeps showing a conversation the BE has already forgotten. */
export const AI_CHAT_SESSION_TTL_MS = 30 * 60 * 1000;

/** First-person starter prompts shown on the suggestions bar before the
 *  first message — sent verbatim as the user's first real message when
 *  clicked. */
export const AI_CHAT_STARTER_QUESTIONS = [
    "What movies are playing now?",
    "Show me the food & drinks menu",
    "Any promotions available right now?",
];

export const AI_CHAT_GREETING =
    "Hi there! I'm CV's AI assistant. I can help you find movies, suggest F&B combos, and answer questions about bookings, payments, membership, or vouchers. What can I help you with?";
