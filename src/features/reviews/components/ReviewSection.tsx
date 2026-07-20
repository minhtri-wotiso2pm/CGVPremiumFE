import { type FC, useState } from "react";
import { useMovieReviews } from "../hooks/useMovieReviews";
import { REVIEW_PAGE_SIZE } from "../constants/review.constants";
import ReviewSummary from "./ReviewSummary";
import ReviewCard from "./ReviewCard";
import "./reviews.css";

const EMPTY_BREAKDOWN = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } as const;

const ReviewSection: FC<{ movieId: number }> = ({ movieId }) => {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useMovieReviews(movieId, page, REVIEW_PAGE_SIZE);

    const totalReviews = data?.totalReviews ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalReviews / REVIEW_PAGE_SIZE));

    return (
        <section className="cgv-detail-section rv-section" aria-labelledby="reviews-heading">
            <h2 className="cgv-detail-section__title" id="reviews-heading">Ratings &amp; Reviews</h2>

            {isLoading ? (
                <>
                    <div className="rv-skel" style={{ height: 140, marginBottom: 28 }} />
                    <div className="rv-list">
                        {Array.from({ length: 3 }).map((_, i) => <div className="rv-skel" key={i} />)}
                    </div>
                </>
            ) : isError ? (
                <div className="rv-empty">
                    <p className="rv-empty__title">Couldn't load reviews</p>
                    <p className="rv-empty__body">Something went wrong while loading reviews for this movie. Please try again later.</p>
                </div>
            ) : (
                <>
                    <ReviewSummary
                        averageRating={data?.averageRating ?? null}
                        totalReviews={totalReviews}
                        breakdown={data?.ratingBreakdown ?? EMPTY_BREAKDOWN}
                    />

                    {totalReviews === 0 || (data?.items.length ?? 0) === 0 ? (
                        <div className="rv-empty">
                            <p className="rv-empty__title">No reviews yet</p>
                            <p className="rv-empty__body">
                                Be the first to share your thoughts — reviews open up after you've watched the movie.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="rv-list">
                                {data!.items.map((item) => (
                                    <ReviewCard key={item.reviewId} item={item} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="rv-pagination">
                                    <button
                                        className="rv-page-btn"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                    >
                                        Prev
                                    </button>
                                    <span className="rv-page-info">Page {page} of {totalPages}</span>
                                    <button
                                        className="rv-page-btn"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </section>
    );
};

export default ReviewSection;
