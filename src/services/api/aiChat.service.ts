import axiosInstance from "@/services/axios/axiosInstance";
import type { ChatRequest, ChatResponse } from "@/features/aiChat/types/aiChat.types";

/** The Gemini call + Render cold-start latency routinely takes 5-10s+ (observed
 *  up to ~6s on a warm container) — well past axiosInstance's shared 10s
 *  default tuned for ordinary CRUD calls. Override just this request so a
 *  slow-but-successful AI reply doesn't get misreported as a failed send. */
export const sendChatMessageApi = async (payload: ChatRequest): Promise<ChatResponse> => {
    const { data } = await axiosInstance.post("/chat", payload, { timeout: 30000 });
    return data;
};
