import type { FC } from "react";
import type { MovieDetail } from "@/features/movies/types/movie.types";
import { AgeBadge } from "@/features/movies/components/MovieStatusBadge";
import { formatDuration } from "../utils/showtime.utils";

interface Props {
    movie: MovieDetail;
}

const ClockIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const ShowtimeMovieInfo: FC<Props> = ({ movie }) => (
    <div className="cgv-st-movie-card">
        {movie.posterUrl ? (
            <img
                src={movie.posterUrl}
                alt={movie.title}
                className="cgv-st-movie-poster"
            />
        ) : (
            <div className="cgv-st-movie-poster-fallback" aria-hidden="true" />
        )}
        <div className="cgv-st-movie-body">
            <h2 className="cgv-st-movie-title">{movie.title}</h2>
            <div className="cgv-st-movie-badges">
                <AgeBadge rating={movie.ageRating} />
                <span className="cgv-st-movie-duration">
                    <ClockIcon />
                    {formatDuration(movie.durationMinutes)}
                </span>
            </div>
            {movie.genres.length > 0 && (
                <div className="cgv-st-movie-genres">
                    {movie.genres.map((g) => (
                        <span key={g} className="cgv-st-movie-genre">{g}</span>
                    ))}
                </div>
            )}
        </div>
    </div>
);

export default ShowtimeMovieInfo;
