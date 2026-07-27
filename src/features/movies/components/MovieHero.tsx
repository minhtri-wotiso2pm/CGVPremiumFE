import { type FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Movie } from "@/features/movies/types/movie.types";
import { getYouTubeId } from "@/features/movies/utils/movie.utils";
import { useMovieDetail } from "@/features/movies/hooks/useMovieDetail";
import { SPLASH_TOTAL_MS } from "@/components/common/SplashScreen/SplashScreen";
import { useIntroEntrance } from "@/components/common/SplashScreen/useIntroEntrance";
import HeroBackgroundLayer from "./hero/HeroBackgroundLayer";
import HeroPosterLayer from "./hero/HeroPosterLayer";
import HeroVideoLayer from "./hero/HeroVideoLayer";
import HeroOverlayInfo from "./hero/HeroOverlayInfo";
import HeroControls from "./hero/HeroControls";
import { usePreloadNextTrailer } from "./hero/usePreloadNextTrailer";
import "./hero/hero.css";

interface Props {
    featuredMovies: Movie[];
    totalMovies: number;
    onMovieClick: (movieId: number) => void;
    onBook: (movieId: number) => void;
}

const HERO_FALLBACK_BG = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&q=80";
const AUTOPLAY_MS = 6000; // 5–7s per brief
const AUTO_TRAILER_DELAY_MS = 3000; // 2–5s per brief

const matches = (query: string) => typeof window !== "undefined" && window.matchMedia(query).matches;

/**
 * HeroCarousel — Netflix-style hero with hybrid poster→trailer slides.
 * Only the active slide ever mounts a video player; every other slide
 * renders a plain <img> poster. See ./hero/* for the layer components
 * (PosterLayer, VideoLayer, BackgroundSyncLayer, OverlayInfoPanel,
 * Controls) and the ParallaxEngine / PreloadManager hooks.
 */
const MovieHero: FC<Props> = ({ featuredMovies, totalMovies, onMovieClick, onBook }) => {
    const { t } = useTranslation("movies");
    const playIntro = useIntroEntrance();

    const [isTouch] = useState(() => !matches("(hover: hover) and (pointer: fine)"));
    const [reducedMotion] = useState(() => matches("(prefers-reduced-motion: reduce)"));

    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [hovering, setHovering] = useState(false);
    const [autoTriggered, setAutoTriggered] = useState(false);
    const [manualPlay, setManualPlay] = useState(false);
    const [everPlayedThisSlide, setEverPlayedThisSlide] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [muted, setMuted] = useState(true);

    const slideCount = featuredMovies.length;
    // Derived instead of synced via effect — avoids an extra render if the
    // movie list shrinks (e.g. filters change upstream).
    const safeIndex = activeIndex < slideCount ? activeIndex : 0;
    const activeMovie = featuredMovies[safeIndex] as Movie | undefined;
    const nextMovie = slideCount > 0 ? featuredMovies[(safeIndex + 1) % slideCount] : undefined;

    /* ── Data: detail for the active slide only, trailer preloaded for the next ── */
    const { data: activeDetail } = useMovieDetail(activeMovie?.movieId ?? 0);
    usePreloadNextTrailer(nextMovie && nextMovie.movieId !== activeMovie?.movieId ? nextMovie.movieId : undefined);

    const trailerId = activeDetail?.trailerUrl ? getYouTubeId(activeDetail.trailerUrl) : null;
    const canAutoPlay = !isTouch && !reducedMotion && !!trailerId;
    const canTapPlay = isTouch && !!trailerId;

    /* ── Reset per-slide play state whenever the active slide changes ──
       Adjusted during render (React's documented pattern for resetting
       state on prop/derived-value change) instead of an effect, so it
       can't trigger the extra "commit → effect → re-render" round trip. */
    const [prevSafeIndex, setPrevSafeIndex] = useState(safeIndex);
    if (prevSafeIndex !== safeIndex) {
        setPrevSafeIndex(safeIndex);
        setAutoTriggered(false);
        setManualPlay(false);
        setEverPlayedThisSlide(false);
        setVideoPlaying(false);
    }

    /* ── Ambient auto-trailer timer — desktop only, skipped while hovering
       (hover already triggers play immediately) ── */
    useEffect(() => {
        if (!canAutoPlay || hovering) return;
        const t = setTimeout(() => setAutoTriggered(true), AUTO_TRAILER_DELAY_MS);
        return () => clearTimeout(t);
    }, [safeIndex, hovering, canAutoPlay]);

    const playRequested = (canAutoPlay && (hovering || autoTriggered)) || (canTapPlay && manualPlay);

    // Once a slide starts playing, keep its VideoLayer mounted (so
    // pause/resume toggles the same player instead of recreating it).
    if (playRequested && !everPlayedThisSlide) {
        setEverPlayedThisSlide(true);
    }

    /* ── Carousel autoplay — pauses while hovering or while a trailer is
       actually playing, so it never yanks away mid-trailer ── */
    useEffect(() => {
        if (slideCount <= 1 || hovering || videoPlaying || reducedMotion) return;
        const id = setInterval(() => {
            setDirection(1);
            setActiveIndex((i) => (i + 1) % slideCount);
        }, AUTOPLAY_MS);
        return () => clearInterval(id);
    }, [slideCount, hovering, videoPlaying, reducedMotion]);

    const goPrev = useCallback(() => {
        setDirection(-1);
        setActiveIndex((i) => (i - 1 + slideCount) % slideCount);
    }, [slideCount]);

    const goNext = useCallback(() => {
        setDirection(1);
        setActiveIndex((i) => (i + 1) % slideCount);
    }, [slideCount]);

    const handleMouseLeave = () => {
        setHovering(false);
        setAutoTriggered(false); // "mouse leave pauses video and returns poster state"
        setVideoPlaying(false); // optimistic — instant poster crossfade back
    };

    /* ── Touch swipe — arrows are hidden on mobile, swipe replaces them ── */
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const SWIPE_THRESHOLD = 40;
        if (deltaX > SWIPE_THRESHOLD) goPrev();
        else if (deltaX < -SWIPE_THRESHOLD) goNext();
        setTouchStartX(null);
    };

    const shouldMountVideo = !!trailerId && everPlayedThisSlide;

    return (
        <section
            className={`cgv-hero${playIntro ? " cgv-hero--intro" : ""}`}
            style={playIntro ? { animationDelay: `${SPLASH_TOTAL_MS + 60}ms` } : undefined}
            aria-label={t("hero.aria", { count: totalMovies })}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <HeroBackgroundLayer
                movies={featuredMovies}
                activeIndex={safeIndex}
                fallbackUrl={HERO_FALLBACK_BG}
                videoPlaying={videoPlaying}
            />
            <div className="cgv-hero__gradient" aria-hidden="true" />

            {/* Center layer — poster for every slide, video only for the active one */}
            <div className="cgv-hero__stage">
                {featuredMovies.map((movie, i) => (
                    <HeroPosterLayer
                        key={movie.movieId}
                        posterUrl={movie.posterUrl}
                        fallbackUrl={HERO_FALLBACK_BG}
                        title={movie.title}
                        active={i === safeIndex}
                        videoPlaying={i === safeIndex && videoPlaying}
                        showTapToPlay={i === safeIndex && canTapPlay && !videoPlaying}
                        onTapPlay={() => setManualPlay(true)}
                    />
                ))}
                {shouldMountVideo && activeMovie && (
                    <HeroVideoLayer
                        key={activeMovie.movieId}
                        videoId={trailerId as string}
                        muted={muted}
                        playRequested={playRequested}
                        isVisible={videoPlaying}
                        onPlayingChange={setVideoPlaying}
                    />
                )}
            </div>

            <HeroControls
                showNav={slideCount > 1}
                onPrev={goPrev}
                onNext={goNext}
                showMute={!!trailerId}
                muted={muted}
                pulsing={videoPlaying && muted}
                onToggleMute={() => setMuted((m) => !m)}
            />

            {activeMovie ? (
                <HeroOverlayInfo
                    key={activeMovie.movieId}
                    movie={activeMovie}
                    synopsis={activeDetail?.synopsis}
                    direction={direction}
                    onBook={onBook}
                    onDetails={onMovieClick}
                />
            ) : (
                <div className="cgv-hoverlay">
                    <p className="cgv-hoverlay__eyebrow">CV Premium</p>
                    <h1 className="cgv-hoverlay__title">{t("status.nowShowing")}</h1>
                    <p className="cgv-hoverlay__desc">{t("hero.fallbackDesc")}</p>
                </div>
            )}
        </section>
    );
};

export default MovieHero;
