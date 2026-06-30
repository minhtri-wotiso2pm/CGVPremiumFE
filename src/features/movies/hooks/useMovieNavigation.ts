import { useNavigate } from "react-router-dom";

export function useMovieNavigation() {

    const navigate = useNavigate();

    return {

        goMovieDetail(id: number) {
            navigate(`/customer/movies/${id}`);
        },

        goShowtimes(movieId: number) {
            navigate(`/customer/movie/${movieId}/showtimes`);
        },

        goBooking(id: number) {
            navigate(`/customer/movie/${id}/showtimes`);
        },

    };

}