import { type FC, useMemo, useState } from "react";
import { useCinemas } from "@/features/manager/hooks/useCinemas";
import type { Cinema } from "@/features/manager/types/cinema.types";
import { normalizeText } from "@/utils/string";
import TheaterMap from "../components/TheaterMap";
import "../theaters.css";

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const ResetIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
);

const CinemaIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="13" height="18" rx="1" />
        <path d="M14 8h4l3 4v9h-7V8z" />
        <line x1="5" y1="7" x2="5" y2="7.01" strokeWidth="2.5" />
        <line x1="9" y1="7" x2="9" y2="7.01" strokeWidth="2.5" />
        <line x1="5" y1="12" x2="5" y2="12.01" strokeWidth="2.5" />
        <line x1="9" y1="12" x2="9" y2="12.01" strokeWidth="2.5" />
    </svg>
);

const PinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const TheaterCard: FC<{ cinema: Cinema; selected: boolean; onSelect: () => void }> = ({ cinema, selected, onSelect }) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${cinema.cinemaName}, ${cinema.address}`,
    )}`;

    return (
        <div className={`thtr-card${selected ? " thtr-card--selected" : ""}`}>
            <div className="thtr-card__head">
                <div className="thtr-card__icon"><CinemaIcon /></div>
                <div className="thtr-card__info">
                    <h3 className="thtr-card__name">{cinema.cinemaName}</h3>
                    <p className="thtr-card__address">{cinema.address}</p>
                </div>
            </div>

            <div className="thtr-card__actions">
                <button
                    className={`thtr-card__select${selected ? " thtr-card__select--active" : ""}`}
                    onClick={onSelect}
                >
                    {selected ? "Selected" : "Select Cinema"}
                </button>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="thtr-card__cta">
                    <PinIcon />
                    Get Directions
                </a>
            </div>
        </div>
    );
};

const TheatersPage: FC = () => {
    const { data: cinemas = [], isLoading } = useCinemas();
    const [search, setSearch] = useState("");
    const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);

    const activeCinemas = useMemo(
        () => cinemas.filter((c) => c.status === "ACTIVE"),
        [cinemas],
    );

    const filtered = useMemo(() => {
        const q = normalizeText(search);
        if (!q) return activeCinemas;
        return activeCinemas.filter(
            (c) => normalizeText(c.cinemaName).includes(q) || normalizeText(c.address).includes(q),
        );
    }, [activeCinemas, search]);

    const handleReset = () => {
        setSearch("");
        setSelectedCinemaId(null);
    };

    return (
        <div className="thtr-page">
            <div className="thtr-head">
                <span className="thtr-head__eyebrow">CGV Premium</span>
                <h1 className="thtr-head__title">Select Your Cinema</h1>
                <p className="thtr-head__sub">Find a CGV Premium cinema near you.</p>
            </div>

            <div className="thtr-toolbar">
                <div className="thtr-search">
                    <span className="thtr-search__icon"><SearchIcon /></span>
                    <input
                        type="text"
                        placeholder="Search by name or address..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="thtr-reset" onClick={handleReset} aria-label="Reset filters">
                    <ResetIcon />
                    Reset
                </button>
            </div>

            {!isLoading && (
                <p className="thtr-count">
                    {filtered.length} theater{filtered.length !== 1 ? "s" : ""} found
                </p>
            )}

            {isLoading ? (
                <div className="thtr-layout">
                    <div className="thtr-list">
                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="thtr-skel" />)}
                    </div>
                    <div className="thtr-map">
                        <div className="thtr-skel" style={{ height: "100%" }} />
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="thtr-empty">
                    <p style={{ margin: 0, fontSize: 16 }}>
                        {activeCinemas.length === 0 ? "No theaters available right now." : "No theaters match your search."}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 14 }}>Please check back soon.</p>
                </div>
            ) : (
                <div className="thtr-layout">
                    <div className="thtr-list">
                        {filtered.map((c) => (
                            <TheaterCard
                                key={c.cinemaId}
                                cinema={c}
                                selected={c.cinemaId === selectedCinemaId}
                                onSelect={() => setSelectedCinemaId(c.cinemaId)}
                            />
                        ))}
                    </div>
                    <TheaterMap
                        cinemas={filtered}
                        selectedCinemaId={selectedCinemaId}
                        onSelect={setSelectedCinemaId}
                    />
                </div>
            )}
        </div>
    );
};

export default TheatersPage;
