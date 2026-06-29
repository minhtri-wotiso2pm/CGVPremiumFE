import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import MovieListPage from "@/features/movies/pages/MovieListPage";

export default function WelcomePage() {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);

    const handleMovieClick = (id: number) => {
        navigate(`/movies/${id}`);
    };

    const handleBook = (id: number) => {
        if (user) {
            navigate(`/customer/booking/${id}`);
        } else {
            navigate("/login");
        }
    };

    return (
        <MovieListPage
            onMovieClick={handleMovieClick}
            onBook={handleBook}
        />
    );
}
