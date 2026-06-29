import { useNavigate } from "react-router-dom";

export function useMovieNavigation() {

    const navigate = useNavigate();

    return {

        goMovieDetail(id: number) {

            navigate(`/customer/movies/${id}`);

        },

        goBooking(id: number) {

            navigate(`/customer/booking/${id}`);

        }

    }

}