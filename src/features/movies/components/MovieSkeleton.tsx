import type { FC } from "react";
import "./movies.css";

const MovieSkeletonCard: FC = () => (
    <div className="cgv-skeleton-card" aria-hidden="true">
        <div className="cgv-skeleton-card__poster cgv-skeleton" />
        <div className="cgv-skeleton-card__body">
            <div className="cgv-skeleton" style={{ height: 14, borderRadius: 4, width: "85%" }} />
            <div className="cgv-skeleton" style={{ height: 12, borderRadius: 4, width: "60%" }} />
            <div className="cgv-skeleton" style={{ height: 10, borderRadius: 4, width: "40%", marginTop: 4 }} />
        </div>
    </div>
);

interface Props { count?: number }

const MovieSkeleton: FC<Props> = ({ count = 10 }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <MovieSkeletonCard key={i} />
        ))}
    </>
);

export default MovieSkeleton;