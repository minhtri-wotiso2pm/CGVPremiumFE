import { useNavigate, useLocation } from "react-router-dom";

export function useMovieNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    const basePath = location.pathname.startsWith("/staff")
        ? "/staff"
        : "/customer";

    return {
        goMovieDetail(id: number) {
            navigate(`${basePath}/movies/${id}`);
        },

        goShowtimes(movieId: number) {
            navigate(`${basePath}/movie/${movieId}/showtimes`);
        },

        goBooking(id: number) {
            navigate(`${basePath}/movie/${id}/showtimes`);
        },
    };
}