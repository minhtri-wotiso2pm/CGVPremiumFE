import { type FC, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { useMovies } from "@/features/movies/hooks/useMovies";
import { useCinemas } from "@/features/manager/hooks/useCinemas";
import { useCinemaShowtimes } from "../hooks/useCinemaShowtimes";
import MovieGrid from "@/features/movies/components/MovieGrid";
import ShowtimeDateSelector from "@/features/booking/components/ShowtimeDateSelector";
import { getTodayString } from "@/features/booking/utils/showtime.utils";
import "@/features/booking/components/showtime.css";
import "../theaters.css";

const BackIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const CinemaMoviesPage: FC = () => {
    const { t } = useTranslation("public");
    const { cinemaId } = useParams<{ cinemaId: string }>();
    const id = Number(cinemaId);
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);

    const [selectedDate, setSelectedDate] = useState<string>(getTodayString);

    /* ── Cinema meta (for the header) ── */
    const { data: cinemas = [] } = useCinemas();
    const cinema = useMemo(() => cinemas.find((c) => c.cinemaId === id), [cinemas, id]);

    /* ── All movies (full cards) + this cinema's showtimes for the date ── */
    const { movies, loading: moviesLoading, error: moviesError, refetch } = useMovies();
    const {
        data: showtimeData,
        isLoading: showtimesLoading,
        isError: showtimesError,
    } = useCinemaShowtimes(id, selectedDate);

    /* ── Movies that actually have a showtime here on this date ── */
    const playingMovies = useMemo(() => {
        const playingIds = new Set((showtimeData?.items ?? []).map((s) => s.movie.movieId));
        return movies.filter((m) => playingIds.has(m.movieId));
    }, [movies, showtimeData]);

    const loading = moviesLoading || showtimesLoading;
    const error = moviesError || showtimesError;

    /* ── Navigation ── */
    const goBack = () => navigate(user ? "/customer/theaters" : "/theaters");

    const handleCardClick = (movieId: number) => navigate(`/movies/${movieId}`);

    const handleBook = (movieId: number) => {
        const dest = `/customer/movie/${movieId}/showtimes`;
        if (user) {
            // Carry the chosen cinema + date so the showtime page opens already
            // filtered to this theater on this day.
            navigate(dest, {
                state: { cinemaId: id, cinemaName: cinema?.cinemaName, date: selectedDate },
            });
        } else {
            navigate("/login", { state: { from: dest } });
        }
    };

    return (
        <div className="thtr-page">
            <div className="thtr-head">
                <span className="thtr-head__eyebrow">CV Premium</span>
                <h1 className="thtr-head__title">{cinema?.cinemaName ?? t("cinemaMovies.cinema")}</h1>
                {cinema?.address && <p className="thtr-head__sub">{cinema.address}</p>}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <button className="thtr-reset" onClick={goBack}>
                    <BackIcon />
                    {t("cinemaMovies.allCinemas")}
                </button>
            </div>

            <div className="cgv-st-section" style={{ marginBottom: 28 }}>
                <span className="cgv-st-section-label">{t("booking:showtime.selectDate")}</span>
                <ShowtimeDateSelector selectedDate={selectedDate} onChange={setSelectedDate} />
            </div>

            <MovieGrid
                movies={playingMovies}
                loading={loading}
                error={error}
                sectionTitle={t("cinemaMovies.sectionTitle")}
                onCardClick={handleCardClick}
                onBook={handleBook}
                onReset={() => setSelectedDate(getTodayString())}
                onRetry={refetch}
            />
        </div>
    );
};

export default CinemaMoviesPage;
