import { type FC } from "react";
import type { Movie } from "@/features/movies/types/movie.types";

interface Props {
    movies: Movie[];
    activeIndex: number;
    fallbackUrl: string;
    videoPlaying: boolean;
}

/** BackgroundSyncLayer — a cinematic blurred backdrop that always matches
 *  the active slide. All posters are pre-rendered and cross-fade via
 *  opacity only (no image swap = no flash), and blur deepens slightly
 *  once the trailer is actually playing for extra depth. */
const HeroBackgroundLayer: FC<Props> = ({ movies, activeIndex, fallbackUrl, videoPlaying }) => (
    <div className={`cgv-hbg${videoPlaying ? " cgv-hbg--deep" : ""}`} aria-hidden="true">
        {movies.map((movie, i) => (
            <div
                key={movie.movieId}
                className="cgv-hbg__layer"
                style={{
                    backgroundImage: `url(${movie.posterUrl || fallbackUrl})`,
                    opacity: i === activeIndex ? 1 : 0,
                }}
            />
        ))}
        {movies.length === 0 && (
            <div className="cgv-hbg__layer" style={{ backgroundImage: `url(${fallbackUrl})`, opacity: 1 }} />
        )}
    </div>
);

export default HeroBackgroundLayer;
