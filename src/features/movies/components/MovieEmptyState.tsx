import type { FC } from "react";
import "./movies.css";

interface Props { onReset: () => void }

const MovieEmptyState: FC<Props> = ({ onReset }) => (
    <div className="cgv-state-card" role="status" aria-live="polite">
        <div className="cgv-state-card__icon">🎬</div>
        <h2 className="cgv-state-card__title">No movies found</h2>
        <p className="cgv-state-card__body">
            We couldn't find any movies matching your filters. Try adjusting your search or browse all titles.
        </p>
        <button className="cgv-state-card__btn cgv-state-card__btn--primary" onClick={onReset}>
            Reset Filters
        </button>
    </div>
);

export default MovieEmptyState;