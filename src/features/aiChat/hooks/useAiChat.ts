import { useCallback, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { sendChatMessageApi } from "@/services/api/aiChat.service";
import type { ChatMessage } from "../types/aiChat.types";
import { AI_CHAT_MAX_LENGTH } from "../constants/aiChat.constants";
import { genMessageId, loadChatState, saveChatState, clearChatState } from "../utils/aiChat.utils";

const resolveErrorReason = (error: unknown): "rate_limit" | "network" =>
    isAxiosError(error) && error.response?.status === 429 ? "rate_limit" : "network";

/** Owns the live conversation. Not React Query for the message list itself —
 *  this is a stateful conversation, not cacheable server data — only the
 *  send call is a mutation. sessionStorage is the single source of truth,
 *  shared by the mini panel and the full page (never mounted together). */
export function useAiChat() {
    const initial = useMemo(() => loadChatState(), []);
    const [messages, setMessages] = useState<ChatMessage[]>(initial?.messages ?? []);
    const sessionIdRef = useRef<string | null>(initial?.sessionId ?? null);

    const persist = useCallback((next: ChatMessage[]) => {
        saveChatState({
            sessionId: sessionIdRef.current,
            messages: next,
            lastActivityAt: Date.now(),
        });
    }, []);

    const mutation = useMutation({
        mutationFn: sendChatMessageApi,
    });

    const dispatch = useCallback(
        (userMessageId: string, text: string) => {
            mutation.mutate(
                { message: text, sessionId: sessionIdRef.current ?? undefined },
                {
                    onSuccess: (data) => {
                        sessionIdRef.current = data.sessionId;
                        setMessages((prev) => {
                            const next: ChatMessage[] = [
                                ...prev.map((m) => (m.id === userMessageId ? { ...m, failed: false, errorReason: undefined } : m)),
                                {
                                    id: genMessageId(),
                                    role: "assistant",
                                    content: data.reply,
                                    followUpQuestions: data.followUpQuestions,
                                },
                            ];
                            persist(next);
                            return next;
                        });
                    },
                    onError: (error) => {
                        const reason = resolveErrorReason(error);
                        setMessages((prev) => {
                            const next = prev.map((m) =>
                                m.id === userMessageId ? { ...m, failed: true, errorReason: reason } : m,
                            );
                            persist(next);
                            return next;
                        });
                    },
                },
            );
        },
        [mutation, persist],
    );

    const sendMessage = useCallback(
        (rawText: string) => {
            const text = rawText.trim().slice(0, AI_CHAT_MAX_LENGTH);
            if (!text) return;

            const userMessageId = genMessageId();
            setMessages((prev) => {
                const next: ChatMessage[] = [...prev, { id: userMessageId, role: "user", content: text }];
                persist(next);
                return next;
            });
            dispatch(userMessageId, text);
        },
        [dispatch, persist],
    );

    const retry = useCallback(
        (messageId: string) => {
            const target = messages.find((m) => m.id === messageId);
            if (!target) return;
            setMessages((prev) => {
                const next = prev.map((m) =>
                    m.id === messageId ? { ...m, failed: false, errorReason: undefined } : m,
                );
                persist(next);
                return next;
            });
            dispatch(messageId, target.content);
        },
        [messages, dispatch, persist],
    );

    const resetConversation = useCallback(() => {
        sessionIdRef.current = null;
        setMessages([]);
        clearChatState();
    }, []);

    return {
        messages,
        sendMessage,
        retry,
        resetConversation,
        isSending: mutation.isPending,
    };
}
