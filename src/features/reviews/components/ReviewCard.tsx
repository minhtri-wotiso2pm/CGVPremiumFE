import { type FC } from "react";
import type { MovieReviewItem } from "../types/review.types";
import { timeAgo } from "../utils/reviewFormat";
import StarRating from "./StarRating";

const VerifiedIcon: FC = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2.5l2.3 1.7 2.8-.2 1 2.7 2.4 1.5-.9 2.7.9 2.7-2.4 1.5-1 2.7-2.8-.2L12 21.5l-2.3-1.7-2.8.2-1-2.7L3.5 15.8l.9-2.7-.9-2.7 2.4-1.5 1-2.7 2.8.2L12 2.5z" />
        <path d="M8.6 12.2l2.2 2.2 4.4-4.6" stroke="#4ade80" />
    </svg>
);

const initial = (name: string) => (name.trim()[0] ?? "?").toUpperCase();

const ReviewCard: FC<{ item: MovieReviewItem }> = ({ item }) => {
    const { user, rating, comment, createdAt } = item;
    return (
        <div className="rv-card">
            {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="rv-avatar" />
            ) : (
                <div className="rv-avatar-ph">{initial(user.name)}</div>
            )}
            <div className="rv-card__body">
                <div className="rv-card__head">
                    <span className="rv-name">{user.name || "Anonymous"}</span>
                    <span className="rv-verified"><VerifiedIcon /> Verified viewer</span>
                    <span className="rv-date">{timeAgo(createdAt)}</span>
                </div>
                <div className="rv-card__stars">
                    <StarRating value={rating} size={14} />
                </div>
                {comment?.trim() ? (
                    <p className="rv-comment">{comment}</p>
                ) : (
                    <p className="rv-comment rv-comment-empty">Rated {rating} out of 5 — no written review.</p>
                )}
            </div>
        </div>
    );
};

export default ReviewCard;
