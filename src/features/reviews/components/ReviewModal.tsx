import { type FC, useState } from "react";
import { Modal, Input, Button } from "antd";
import { FilmClapperIcon } from "@/components/ui/BrandIcons";
import { useCreateReview } from "../hooks/useCreateReview";
import { REVIEW_COMMENT_MAX } from "../constants/review.constants";
import StarRatingInput from "./StarRatingInput";
import styles from "./ReviewModal.module.css";

export interface ReviewTarget {
    bookingID: number;
    movieTitle: string;
    posterUrl?: string;
    subtitle?: string;
}

interface Props {
    open: boolean;
    booking: ReviewTarget | null;
    onClose: () => void;
}

const ReviewModal: FC<Props> = ({ open, booking, onClose }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const { mutate, isPending } = useCreateReview();

    const handleCancel = () => {
        if (isPending) return;
        onClose();
    };

    const handleSubmit = () => {
        if (!booking || rating < 1) return;
        mutate(
            { bookingId: booking.bookingID, rating, comment: comment.trim() || undefined },
            { onSuccess: onClose },
        );
    };

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            afterClose={() => { setRating(0); setComment(""); }}
            title={<span className={styles.title}>Rate this movie</span>}
            footer={null}
            destroyOnHidden
            maskClosable={!isPending}
            closable={!isPending}
            width={460}
            styles={{
                container: { background: "#1a0f0f", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)" },
                header: { background: "#1a0f0f", borderBottom: "1px solid rgba(255,255,255,0.06)" },
                mask: { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.72)" },
            }}
        >
            {booking && (
                <div className={styles.body}>
                    <div className={styles.movieHead}>
                        {booking.posterUrl ? (
                            <img src={booking.posterUrl} alt={booking.movieTitle} className={styles.poster} />
                        ) : (
                            <div className={styles.posterPh}><FilmClapperIcon size={24} /></div>
                        )}
                        <div className={styles.movieMeta}>
                            <p className={styles.movieTitle}>{booking.movieTitle}</p>
                            {booking.subtitle && <p className={styles.movieSub}>{booking.subtitle}</p>}
                        </div>
                    </div>

                    <div className={styles.ratingBlock}>
                        <p className={styles.ratingHint}>How would you rate your experience?</p>
                        <StarRatingInput value={rating} onChange={setRating} disabled={isPending} />
                    </div>

                    <label className={styles.label} htmlFor="review-comment">
                        Your review <span style={{ color: "#6b4a4a", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <Input.TextArea
                        id="review-comment"
                        className={styles.textarea}
                        placeholder="Share what you liked — the story, the visuals, the sound…"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        maxLength={REVIEW_COMMENT_MAX}
                        disabled={isPending}
                    />
                    <div className={styles.charCount}>{comment.length} / {REVIEW_COMMENT_MAX}</div>

                    <div className={styles.notice}>
                        Reviews are permanent — they can't be edited or deleted after posting, and you can review each
                        movie once.
                    </div>

                    <div className={styles.footer}>
                        <Button className={styles.cancelBtn} onClick={handleCancel} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                            className={styles.submitBtn}
                            type="primary"
                            loading={isPending}
                            disabled={rating < 1}
                            onClick={handleSubmit}
                        >
                            Post Review
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ReviewModal;
