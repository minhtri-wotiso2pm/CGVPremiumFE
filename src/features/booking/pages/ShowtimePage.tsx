import { type FC, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMovieDetail } from "@/features/movies/hooks/useMovieDetail";
import { useShowtimes } from "../hooks/useShowtimes";
import { ALL_ROOM_TYPES } from "../constants/showtime.constants";
import type { ShowtimeCinema } from "../types/showtime.types";
import type { SeatNavState } from "../types/seat.types";
import { getTodayString } from "../utils/showtime.utils";
import ShowtimeMovieInfo from "../components/ShowtimeMovieInfo";
import ShowtimeDateSelector from "../components/ShowtimeDateSelector";
import ShowtimeCinemaFilter from "../components/ShowtimeCinemaFilter";
import ShowtimeRoomTypeFilter from "../components/ShowtimeRoomTypeFilter";
import ShowtimeGrid from "../components/ShowtimeGrid";
import ShowtimeSkeleton, { ShowtimeGridSkeleton, ShowtimeMovieInfoSkeleton } from "../components/ShowtimeSkeleton";
import "../components/showtime.css";

const ShowtimePage: FC = () => {
    const { t } = useTranslation("booking");
    const { movieId } = useParams<{ movieId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const id = Number(movieId);

    /* ── Nav state when arriving from a specific cinema (Theaters flow) ──
       lets the page open already scoped to that theater on that date. ── */
    const navState = (location.state ?? null) as { cinemaId?: number; date?: string } | null;

    /* ── Movie data (cached from MovieDetailPage if visited) ── */
    const { data: movie, isLoading: movieLoading } = useMovieDetail(id);

    /* ── Local filter state ── */
    const [selectedDate, setSelectedDate] = useState<string>(navState?.date ?? getTodayString);
    const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(navState?.cinemaId ?? null);
    const [selectedRoomType, setSelectedRoomType] = useState<string>(ALL_ROOM_TYPES);

    /* ── API: only refetch when date or movieName changes ── */
    const {
        data: showtimeData,
        isLoading: showtimesLoading,
        isError,
        refetch,
    } = useShowtimes(movie?.title ?? "", selectedDate);

    const allShowtimes = showtimeData?.items ?? [];

    /* ── Derive unique cinemas from API response ── */
    const cinemas: ShowtimeCinema[] = useMemo(() => {
        const map = new Map<number, ShowtimeCinema>();
        allShowtimes.forEach((s) => {
            if (!map.has(s.cinema.cinemaId)) map.set(s.cinema.cinemaId, s.cinema);
        });
        return Array.from(map.values());
    }, [allShowtimes]);

    /* ── Filter by cinema (local) ── */
    const byCinema = useMemo(
        () =>
            selectedCinemaId === null
                ? allShowtimes
                : allShowtimes.filter((s) => s.cinema.cinemaId === selectedCinemaId),
        [allShowtimes, selectedCinemaId]
    );

    /* ── Derive room types from cinema-filtered list ── */
    const roomTypes: string[] = useMemo(
        () => Array.from(new Set(byCinema.map((s) => s.room.roomType))),
        [byCinema]
    );

    /* ── Filter by room type (local) ── */
    const finalShowtimes = useMemo(
        () =>
            selectedRoomType === ALL_ROOM_TYPES
                ? byCinema
                : byCinema.filter((s) => s.room.roomType === selectedRoomType),
        [byCinema, selectedRoomType]
    );

    /* ── Handlers with cascade reset ── */
    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        setSelectedCinemaId(null);
        setSelectedRoomType(ALL_ROOM_TYPES);
    };

    const handleCinemaChange = (cinemaId: number | null) => {
        setSelectedCinemaId(cinemaId);
        setSelectedRoomType(ALL_ROOM_TYPES);
    };

    const handleShowtimeSelect = (showtimeId: number) => {
        const showtime = allShowtimes.find((s) => s.showtimeId === showtimeId);
        const state: SeatNavState = {
            movieId:       id,
            movieTitle:    movie?.title,
            moviePoster:   movie?.posterUrl,
            movieDuration: movie?.durationMinutes,
            movieAgeRating:movie?.ageRating,
            startTime:     showtime?.startTime,
            endTime:       showtime?.endTime,
            cinemaId:      showtime?.cinema.cinemaId,
            cinemaName:    showtime?.cinema.cinemaName,
            roomName:      showtime?.room.roomName,
            roomType:      showtime?.room.roomType,
        };
        navigate(`/customer/seats/${showtimeId}`, { state });
    };

    const hasCinemaOrRoomFilter =
        selectedCinemaId !== null || selectedRoomType !== ALL_ROOM_TYPES;

    return (
        <div className="cgv-st-page cgv-st-fade-in">
            {/* Breadcrumb */}
            <nav className="cgv-st-breadcrumb" aria-label="Breadcrumb">
                <Link to="/customer">{t("breadcrumb.home")}</Link>
                <span className="cgv-st-breadcrumb__sep" aria-hidden="true">›</span>
                <Link to="/customer">{t("breadcrumb.movies")}</Link>
                {movie && (
                    <>
                        <span className="cgv-st-breadcrumb__sep" aria-hidden="true">›</span>
                        <Link to={`/customer/movies/${id}`}>{movie.title}</Link>
                    </>
                )}
                <span className="cgv-st-breadcrumb__sep" aria-hidden="true">›</span>
                <span className="cgv-st-breadcrumb__current">{t("showtime.breadcrumbCurrent")}</span>
            </nav>

            <div className="cgv-st-inner">
                {/* ── LEFT: Movie info ── */}
                <div className="cgv-st-movie-panel">
                    {movieLoading ? (
                        <ShowtimeMovieInfoSkeleton />
                    ) : movie ? (
                        <ShowtimeMovieInfo movie={movie} />
                    ) : null}
                </div>

                {/* ── RIGHT: Selection ──
                    movieLoading = first page open → full skeleton
                    showtimesLoading = date change → grid skeleton only, filters stay
                ── */}
                {movieLoading ? (
                    <ShowtimeSkeleton />
                ) : (
                    <div className="cgv-st-selection">
                        {/* Date — always visible */}
                        <div className="cgv-st-section">
                            <span className="cgv-st-section-label">{t("showtime.selectDate")}</span>
                            <ShowtimeDateSelector
                                selectedDate={selectedDate}
                                onChange={handleDateChange}
                            />
                        </div>

                        {/* Cinema — always visible once data has loaded */}
                        {cinemas.length > 0 && (
                            <div className="cgv-st-section">
                                <span className="cgv-st-section-label">{t("showtime.cinema")}</span>
                                <ShowtimeCinemaFilter
                                    cinemas={cinemas}
                                    selectedCinemaId={selectedCinemaId}
                                    onChange={handleCinemaChange}
                                />
                            </div>
                        )}

                        {/* Room type — always visible */}
                        {roomTypes.length > 1 && (
                            <div className="cgv-st-section">
                                <span className="cgv-st-section-label">{t("showtime.roomType")}</span>
                                <ShowtimeRoomTypeFilter
                                    roomTypes={roomTypes}
                                    selected={selectedRoomType}
                                    onChange={setSelectedRoomType}
                                />
                            </div>
                        )}

                        {/* Showtimes — only this section skeletons on date change */}
                        <div className="cgv-st-section">
                            <span className="cgv-st-section-label">{t("showtime.showtimes")}</span>
                            {showtimesLoading ? (
                                <ShowtimeGridSkeleton />
                            ) : (
                                <ShowtimeGrid
                                    showtimes={finalShowtimes}
                                    isError={isError}
                                    hasCinemaOrRoomFilter={hasCinemaOrRoomFilter}
                                    onSelect={handleShowtimeSelect}
                                    onRetry={refetch}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowtimePage;
