import { type FC, type ChangeEvent } from "react";
import "./movies.css";

export type StatusFilter = "ALL" | "NOW_SHOWING" | "COMING_SOON";

interface Props {
    search: string;
    status: StatusFilter;
    genre: string;
    genres: string[];       // derived from API data
    totalCount: number;
    filteredCount: number;
    onSearchChange: (v: string) => void;
    onStatusChange: (v: StatusFilter) => void;
    onGenreChange: (v: string) => void;
}

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Now Showing", value: "NOW_SHOWING" },
    { label: "Coming Soon", value: "COMING_SOON" },
];

const MovieFilterBar: FC<Props> = ({
    search, status, genre, genres,
    totalCount, filteredCount,
    onSearchChange, onStatusChange, onGenreChange,
}) => (
    <div className="cgv-filterbar" role="search" aria-label="Filter movies">
        <div className="cgv-filterbar__inner">

            {/* Search */}
            <div className="cgv-filterbar__search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    style={{ color: "var(--cgv-text-muted)", flexShrink: 0 }} aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="search"
                    className="cgv-filterbar__search-input"
                    placeholder="Search movies…"
                    value={search}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                    aria-label="Search movies by title"
                />
                {search && (
                    <button
                        onClick={() => onSearchChange("")}
                        aria-label="Clear search"
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--cgv-text-muted)", padding: "0 2px", lineHeight: 1,
                        }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Status tabs */}
            <div className="cgv-filterbar__tabs" role="tablist" aria-label="Filter by status">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        role="tab"
                        aria-selected={status === tab.value}
                        className={`cgv-filterbar__tab${status === tab.value ? " cgv-filterbar__tab--active" : ""}`}
                        onClick={() => onStatusChange(tab.value)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Genre dropdown */}
            <div className="cgv-filterbar__select-wrap">
                <select
                    className="cgv-filterbar__select"
                    value={genre}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => onGenreChange(e.target.value)}
                    aria-label="Filter by genre"
                >
                    <option value="">All Genres</option>
                    {genres.map((g) => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
                <svg
                    className="cgv-filterbar__select-icon"
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>

            {/* Result count */}
            <p className="cgv-filterbar__count" aria-live="polite">
                <strong>{filteredCount}</strong> / {totalCount} movies
            </p>
        </div>
    </div>
);

export default MovieFilterBar;