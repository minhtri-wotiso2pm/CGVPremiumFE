import type { FC } from "react";
import { getYouTubeId } from "../utils/movie.utils";
import "./movies.css";

interface Props {
    trailerUrl: string;
    title: string;
}

const MovieDetailTrailer: FC<Props> = ({ trailerUrl, title }) => {
    const videoId = getYouTubeId(trailerUrl);

    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&color=red`;

    return (
        <div className="cgv-detail-trailer-wrap">
            <div className="cgv-detail-trailer__ratio">
                <iframe
                    src={embedUrl}
                    title={`Trailer — ${title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="cgv-detail-trailer__iframe"
                    loading="lazy"
                />
            </div>
        </div>
    );
};

export default MovieDetailTrailer;
