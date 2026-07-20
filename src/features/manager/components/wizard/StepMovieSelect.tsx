import { type FC, useState } from "react";
import { Input, Spin } from "antd";
import { useMovieList } from "../../hooks/useMovieList";
import { MOVIE_STATUS_META, SCHEDULABLE_MOVIE_STATUSES } from "../../types/movie-mgmt.types";

const { Search } = Input;

interface Props {
    movieId: number | null;
    onSelect: (movieId: number) => void;
}

const StepMovieSelect: FC<Props> = ({ movieId, onSelect }) => {
    const { data, isLoading } = useMovieList();
    const [search, setSearch] = useState("");

    // Only movies that can actually be scheduled (now showing / coming soon).
    const movies = (data?.items ?? [])
        .filter((m) => SCHEDULABLE_MOVIE_STATUSES.includes(m.status))
        .filter((m) => m.title.toLowerCase().includes(search.trim().toLowerCase()));

    if (isLoading) {
        return <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><Spin /></div>;
    }

    return (
        <div className="stt-wizard-step">
            <p className="stt-wizard-step__title">Select a movie</p>
            <Search
                placeholder="Search movies..."
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <div className="stt-movie-grid">
                {movies.map((m) => (
                    <button
                        type="button"
                        key={m.movieId}
                        className={`stt-movie-card${movieId === m.movieId ? " stt-movie-card--selected" : ""}`}
                        onClick={() => onSelect(m.movieId)}
                    >
                        <span className="stt-movie-card__poster-wrap">
                            {m.posterUrl ? (
                                <img src={m.posterUrl} alt={m.title} className="stt-movie-card__poster" />
                            ) : (
                                <div className="stt-movie-card__poster stt-movie-card__poster--empty" />
                            )}
                            {MOVIE_STATUS_META[m.status] && (
                                <span
                                    className="stt-movie-card__status"
                                    style={{
                                        background: MOVIE_STATUS_META[m.status].bg,
                                        color: MOVIE_STATUS_META[m.status].color,
                                    }}
                                >
                                    {MOVIE_STATUS_META[m.status].label}
                                </span>
                            )}
                        </span>
                        <span className="stt-movie-card__title">{m.title}</span>
                        <span className="stt-movie-card__meta">
                            {m.ageRating ? `${m.ageRating} · ` : ""}{m.durationMinutes ?? "—"} min
                        </span>
                    </button>
                ))}
                {movies.length === 0 && (
                    <p className="stt-wizard-step__empty">
                        {search ? "No movies match your search." : "No now-showing or coming-soon movies to schedule."}
                    </p>
                )}
            </div>
        </div>
    );
};

export default StepMovieSelect;
