import { type FC, type ChangeEvent, useState, useRef, useEffect } from "react";
import "./movies.css";

export type StatusFilter = "ALL" | "NOW_SHOWING" | "COMING_SOON";

interface Props {
    search: string;
    status: StatusFilter;
    genres: string[];
    allGenres: string[];
    totalCount: number;
    filteredCount: number;
    onSearchChange: (v: string) => void;
    onStatusChange: (v: StatusFilter) => void;
    onGenreToggle: (v: string) => void;
    onGenresClear: () => void;
}

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Now Showing", value: "NOW_SHOWING" },
    { label: "Coming Soon", value: "COMING_SOON" },
];

/* ── Custom Multi-select Genre Dropdown ── */
interface GenreDropdownProps {
    selected: string[];
    allGenres: string[];
    onToggle: (v: string) => void;
    onClear: () => void;
}

const GenreDropdown: FC<GenreDropdownProps> = ({ selected, allGenres, onToggle, onClear }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const count = selected.length;
    const label =
        count === 0 ? "All Genres" : count === 1 ? selected[0] : `${count} genres`;

    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Trigger button */}
            <button
                className={`cgv-genre-btn${count > 0 ? " cgv-genre-btn--active" : ""}`}
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Filter by genre"
            >
                <span className="cgv-genre-btn__label">{label}</span>
                {count > 0 && <span className="cgv-genre-btn__badge">{count}</span>}
                <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    aria-hidden="true"
                    style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="cgv-genre-dropdown" role="listbox" aria-multiselectable="true" aria-label="Genres">
                    {/* Header: clear-all */}
                    <div className="cgv-genre-dropdown__head">
                        <span className="cgv-genre-dropdown__head-label">
                            {count > 0 ? `${count} selected` : "Select genres"}
                        </span>
                        <button
                            className="cgv-genre-dropdown__clear"
                            onClick={onClear}
                            disabled={count === 0}
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="cgv-genre-dropdown__list">
                        {allGenres.map((g) => {
                            const isActive = selected.includes(g);
                            return (
                                <button
                                    key={g}
                                    role="option"
                                    aria-selected={isActive}
                                    className={`cgv-genre-option${isActive ? " cgv-genre-option--active" : ""}`}
                                    onClick={() => onToggle(g)}
                                >
                                    {/* Checkbox */}
                                    <span className={`cgv-genre-check${isActive ? " cgv-genre-check--on" : ""}`}>
                                        {isActive && (
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </span>
                                    {g}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── Filter Bar ── */
const MovieFilterBar: FC<Props> = ({
    search, status, genres, allGenres,
    totalCount, filteredCount,
    onSearchChange, onStatusChange, onGenreToggle, onGenresClear,
}) => (
    <div className="cgv-filterbar" role="search" aria-label="Filter movies">
        <div className="cgv-filterbar__inner">

            {/* Search */}
            <div className="cgv-filterbar__search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                    className="cgv-filterbar__search-icon" aria-hidden="true"
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
                        className="cgv-filterbar__search-clear"
                        onClick={() => onSearchChange("")}
                        aria-label="Clear search"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
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

            {/* Genre multi-select dropdown */}
            <GenreDropdown
                selected={genres}
                allGenres={allGenres}
                onToggle={onGenreToggle}
                onClear={onGenresClear}
            />

            {/* Result count */}
            <p className="cgv-filterbar__count" aria-live="polite">
                <strong>{filteredCount}</strong> / {totalCount} movies
            </p>
        </div>

        {/* Selected genre chips */}
        {genres.length > 0 && (
            <div className="cgv-filterbar__chips" aria-label="Active genre filters">
                {genres.map((g) => (
                    <button
                        key={g}
                        className="cgv-genre-chip"
                        onClick={() => onGenreToggle(g)}
                        aria-label={`Remove ${g} filter`}
                    >
                        {g}
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                ))}
                <button className="cgv-genre-chip cgv-genre-chip--clear" onClick={onGenresClear}>
                    Clear all
                </button>
            </div>
        )}
    </div>
);

export default MovieFilterBar;
