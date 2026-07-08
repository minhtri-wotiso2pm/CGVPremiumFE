import { type FC, useState } from "react";
import { Input, Spin } from "antd";
import { useMovieList } from "../../hooks/useMovieList";

const { Search } = Input;

interface Props {
    movieId: number | null;
    onSelect: (movieId: number) => void;
}

const StepMovieSelect: FC<Props> = ({ movieId, onSelect }) => {
    const { data, isLoading } = useMovieList();
    const [search, setSearch] = useState("");

    const movies = (data?.items ?? []).filter((m) =>
        m.title.toLowerCase().includes(search.trim().toLowerCase())
    );

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
                        {m.posterUrl ? (
                            <img src={m.posterUrl} alt={m.title} className="stt-movie-card__poster" />
                        ) : (
                            <div className="stt-movie-card__poster stt-movie-card__poster--empty" />
                        )}
                        <span className="stt-movie-card__title">{m.title}</span>
                        <span className="stt-movie-card__meta">
                            {m.ageRating ? `${m.ageRating} · ` : ""}{m.durationMinutes ?? "—"} min
                        </span>
                    </button>
                ))}
                {movies.length === 0 && (
                    <p className="stt-wizard-step__empty">No movies match your search.</p>
                )}
            </div>
        </div>
    );
};

export default StepMovieSelect;
