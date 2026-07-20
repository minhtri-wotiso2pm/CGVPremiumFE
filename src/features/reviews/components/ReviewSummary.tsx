import { type FC } from "react";
import type { RatingBreakdown } from "../types/review.types";
import StarRating from "./StarRating";

interface Props {
    averageRating: number | null;
    totalReviews: number;
    breakdown: RatingBreakdown;
}

const StarGlyph: FC = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#f5b301" aria-hidden="true">
        <path d="M12 2L14.35 8.76L21.51 8.91L15.8 13.24L17.88 20.09L12 16L6.12 20.09L8.2 13.24L2.49 8.91L9.65 8.76Z" />
    </svg>
);

const ReviewSummary: FC<Props> = ({ averageRating, totalReviews, breakdown }) => {
    const rows: Array<keyof RatingBreakdown> = ["5", "4", "3", "2", "1"];

    return (
        <div className="rv-summary">
            <div className="rv-summary__score">
                {averageRating != null ? (
                    <>
                        <span className="rv-summary__num">{averageRating.toFixed(1)}</span>
                        <StarRating value={averageRating} size={17} />
                        <span className="rv-summary__count">
                            {totalReviews} review{totalReviews === 1 ? "" : "s"}
                        </span>
                    </>
                ) : (
                    <>
                        <span className="rv-summary__num-empty">—</span>
                        <StarRating value={0} size={17} />
                        <span className="rv-summary__count">No ratings yet</span>
                    </>
                )}
            </div>

            <div className="rv-breakdown">
                {rows.map((star) => {
                    const count = breakdown[star];
                    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                        <div className="rv-bar-row" key={star}>
                            <span className="rv-bar-label">{star}<StarGlyph /></span>
                            <span className="rv-bar-track">
                                <span className="rv-bar-fill" style={{ width: `${pct}%` }} />
                            </span>
                            <span className="rv-bar-count">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReviewSummary;
