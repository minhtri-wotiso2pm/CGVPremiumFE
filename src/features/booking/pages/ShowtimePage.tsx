import { type FC, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMovieDetail } from "@/features/movies/hooks/useMovieDetail";
import { useShowtimes } from "../hooks/useShowtimes";
import { ALL_ROOM_TYPES } from "../constants/showtime.constants";
import type { ShowtimeCinema } from "../types/showtime.types";
import { getTodayString } from "../utils/showtime.utils";
import ShowtimeMovieInfo from "../components/ShowtimeMovieInfo";
import ShowtimeDateSelector from "../components/ShowtimeDateSelector";
import ShowtimeCinemaFilter from "../components/ShowtimeCinemaFilter";
import ShowtimeRoomTypeFilter from "../components/ShowtimeRoomTypeFilter";
import ShowtimeGrid from "../components/ShowtimeGrid";
import ShowtimeSkeleton, { ShowtimeMovieInfoSkeleton } from "../components/ShowtimeSkeleton";
import "../components/showtime.css";

const ShowtimePage: FC = () => {
    const { movieId } = useParams<{ movieId: string }>();
    const navigate = useNavigate();
    const id = Number(movieId);

    /* ── Movie data (cached from MovieDetailPage if visited) ── */
    const { data: movie, isLoading: movieLoading } = useMovieDetail(id);

    /* ── Local filter state ── */
    const [selectedDate, setSelectedDate] = useState<string>(getTodayString);
    const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
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
        navigate(`/seats/${showtimeId}`);
    };

    const isLoading = movieLoading || showtimesLoading;
    const hasCinemaOrRoomFilter =
        selectedCinemaId !== null || selectedRoomType !== ALL_ROOM_TYPES;

    return (
        <div className="cgv-st-page cgv-st-fade-in">
            {/* Breadcrumb */}
            <nav className="cgv-st-breadcrumb" aria-label="Breadcrumb">
                <Link to="/customer">Home</Link>
                <span className="cgv-st-breadcrumb__sep" aria-hidden="true">›</span>
                <Link to="/customer">Movies</Link>
                {movie && (
                    <>
                        <span className="cgv-st-breadcrumb__sep" aria-hidden="true">›</span>
                        <Link to={`/customer/movies/${id}`}>{movie.title}</Link>
                    </>
                )}
                <span className="cgv-st-breadcrumb__sep" aria-hidden="true">›</span>
                <span className="cgv-st-breadcrumb__current">Select Showtime</span>
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

                {/* ── RIGHT: Selection ── */}
                {isLoading ? (
                    <ShowtimeSkeleton />
                ) : (
                    <div className="cgv-st-selection">
                        {/* Date */}
                        <div className="cgv-st-section">
                            <span className="cgv-st-section-label">Select Date</span>
                            <ShowtimeDateSelector
                                selectedDate={selectedDate}
                                onChange={handleDateChange}
                            />
                        </div>

                        {/* Cinema */}
                        {cinemas.length > 0 && (
                            <div className="cgv-st-section">
                                <span className="cgv-st-section-label">Cinema</span>
                                <ShowtimeCinemaFilter
                                    cinemas={cinemas}
                                    selectedCinemaId={selectedCinemaId}
                                    onChange={handleCinemaChange}
                                />
                            </div>
                        )}

                        {/* Room type */}
                        {roomTypes.length > 1 && (
                            <div className="cgv-st-section">
                                <span className="cgv-st-section-label">Room Type</span>
                                <ShowtimeRoomTypeFilter
                                    roomTypes={roomTypes}
                                    selected={selectedRoomType}
                                    onChange={setSelectedRoomType}
                                />
                            </div>
                        )}

                        {/* Showtimes */}
                        <div className="cgv-st-section">
                            <span className="cgv-st-section-label">Showtimes</span>
                            <ShowtimeGrid
                                showtimes={finalShowtimes}
                                isError={isError}
                                hasCinemaOrRoomFilter={hasCinemaOrRoomFilter}
                                onSelect={handleShowtimeSelect}
                                onRetry={refetch}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowtimePage;
