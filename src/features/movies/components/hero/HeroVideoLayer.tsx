import { useEffect, useRef, type FC } from "react";
import { YTPlayerState, useYouTubeApiReady, type YTPlayer } from "./useYouTubeApi";

interface Props {
    videoId: string;
    muted: boolean;
    playRequested: boolean;
    isVisible: boolean;
    onPlayingChange: (playing: boolean) => void;
}

/**
 * VideoLayer — lazy-mounted per active slide only. Wraps a single YouTube
 * IFrame Player instance so we get real programmatic control (mute toggle,
 * play/pause) instead of just baking autoplay params into an iframe src.
 */
const HeroVideoLayer: FC<Props> = ({ videoId, muted, playRequested, isVisible, onPlayingChange }) => {
    const apiReady = useYouTubeApiReady(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const playerReadyRef = useRef(false);

    // Refs so the player's event callbacks (bound once at creation) always
    // see the latest desired state without recreating the player. Synced
    // via effects (not during render) to satisfy react-hooks/refs.
    const mutedRef = useRef(muted);
    const playRequestedRef = useRef(playRequested);
    const onPlayingChangeRef = useRef(onPlayingChange);
    useEffect(() => { mutedRef.current = muted; }, [muted]);
    useEffect(() => { playRequestedRef.current = playRequested; }, [playRequested]);
    useEffect(() => { onPlayingChangeRef.current = onPlayingChange; }, [onPlayingChange]);

    useEffect(() => {
        if (!apiReady || !containerRef.current) return;

        const player = new window.YT!.Player(containerRef.current, {
            videoId,
            playerVars: {
                autoplay: 0,
                mute: 1,
                controls: 0,
                disablekb: 1,
                modestbranding: 1,
                rel: 0,
                iv_load_policy: 3, // no annotations
                cc_load_policy: 0, // no captions/subtitles by default
                playsinline: 1,
                loop: 1,
                playlist: videoId,
            },
            events: {
                onReady: (e) => {
                    playerRef.current = e.target;
                    playerReadyRef.current = true;
                    e.target.unloadModule("captions"); // cc_load_policy alone can't override a viewer's own caption preference
                    if (mutedRef.current) e.target.mute(); else e.target.unMute();
                    if (playRequestedRef.current) e.target.playVideo();
                },
                onStateChange: (e) => {
                    if (e.data === YTPlayerState.PLAYING) {
                        // The captions module can reload on every loop — re-kill it each time it starts playing.
                        playerRef.current?.unloadModule("captions");
                        onPlayingChangeRef.current(true);
                    } else if (e.data === YTPlayerState.PAUSED || e.data === YTPlayerState.ENDED) {
                        onPlayingChangeRef.current(false);
                    }
                },
            },
        });

        return () => {
            playerReadyRef.current = false;
            playerRef.current = null;
            player.destroy();
        };
    }, [apiReady, videoId]);

    useEffect(() => {
        if (!playerReadyRef.current || !playerRef.current) return;
        if (playRequested) playerRef.current.playVideo();
        else playerRef.current.pauseVideo();
    }, [playRequested]);

    useEffect(() => {
        if (!playerReadyRef.current || !playerRef.current) return;
        if (muted) playerRef.current.mute(); else playerRef.current.unMute();
    }, [muted]);

    return (
        <div className={`cgv-hvid${isVisible ? " cgv-hvid--visible" : ""}`} aria-hidden="true">
            <div ref={containerRef} className="cgv-hvid__frame" />
        </div>
    );
};

export default HeroVideoLayer;
