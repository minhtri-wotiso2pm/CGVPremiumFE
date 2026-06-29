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
        const dest = `/customer/movie/${id}/showtimes`;
        if (user) {
            navigate(dest);
        } else {
            navigate("/login", { state: { from: dest } });
        }
    };

    return (
        <MovieListPage
            onMovieClick={handleMovieClick}
            onBook={handleBook}
        />
    );
}
