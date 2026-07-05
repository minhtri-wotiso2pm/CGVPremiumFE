import { useEffect, useState } from "react";

/** Minimal shape of the YouTube IFrame Player API we actually use. */
export interface YTPlayer {
    playVideo(): void;
    pauseVideo(): void;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    destroy(): void;
    /** Forcibly disables a player module — used to kill the captions
     *  module outright, since cc_load_policy alone can't override a
     *  viewer's own "always show captions" YouTube preference. */
    unloadModule(moduleName: string): void;
}

export const YTPlayerState = {
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
} as const;

export interface YTOnStateChangeEvent {
    data: (typeof YTPlayerState)[keyof typeof YTPlayerState];
}

export interface YTPlayerOptions {
    videoId: string;
    playerVars?: Record<string, number | string>;
    events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: YTOnStateChangeEvent) => void;
    };
}

declare global {
    interface Window {
        YT?: {
            Player: new (el: HTMLElement | string, options: YTPlayerOptions) => YTPlayer;
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}

let apiPromise: Promise<void> | null = null;

/** Loads https://www.youtube.com/iframe_api exactly once for the whole app. */
function loadYouTubeApi(): Promise<void> {
    if (window.YT?.Player) return Promise.resolve();
    if (apiPromise) return apiPromise;

    apiPromise = new Promise((resolve) => {
        const previous = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previous?.();
            resolve();
        };
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    });
    return apiPromise;
}

/** Returns true once the global window.YT.Player constructor is ready. */
export function useYouTubeApiReady(shouldLoad: boolean): boolean {
    const [ready, setReady] = useState(() => !!window.YT?.Player);

    useEffect(() => {
        if (!shouldLoad || ready) return;
        let cancelled = false;
        loadYouTubeApi().then(() => {
            if (!cancelled) setReady(true);
        });
        return () => {
            cancelled = true;
        };
    }, [shouldLoad, ready]);

    return ready;
}
