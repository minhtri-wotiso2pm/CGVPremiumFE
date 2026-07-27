import { type FC, useMemo, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Input, DatePicker, Pagination, Button } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useMyBookings } from "@/features/booking/hooks/useMyBookings";
import type { MyBooking } from "@/features/booking/types/ticket.types";
import { canRequestRefund } from "@/features/booking/utils/refund.utils";
import { isFnbOnlyBooking } from "@/features/booking/utils/booking.utils";
import RefundModal, { type RefundBookingInfo } from "@/features/booking/components/RefundModal";
import ReviewModal, { type ReviewTarget } from "@/features/reviews/components/ReviewModal";
import { canWriteReview } from "@/features/reviews/utils/reviewFormat";
import { FilmClapperIcon, FnbBagIcon, CheckCircleIcon } from "@/components/ui/BrandIcons";
import { formatVnd, formatNumber } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDate";
import styles from "./MyTicketsPage.module.css";

const PAGE_SIZE = 10;

/** Cancelled/expired bookings never made it to a real screening — no
 *  value in surfacing them in the customer's ticket list at all. */
const HIDDEN_STATUSES = new Set(["cancelled", "expired", "pending"]);

/* labelKey resolves in the profile namespace; null falls back to the raw status. */
const statusStyle = (status: string): { bg: string; color: string; labelKey: string | null } => {
    const s = status.toLowerCase();
    if (s === "paid") return { bg: "rgba(34,197,94,0.14)", color: "#4ade80", labelKey: "tickets.status.paid" };
    if (s === "used") return { bg: "rgba(167,139,250,0.14)", color: "#a78bfa", labelKey: "tickets.status.attended" };
    if (s === "pending") return { bg: "rgba(245,158,11,0.14)", color: "#fbbf24", labelKey: "tickets.status.pending" };
    if (s === "refunded") return { bg: "rgba(96,165,250,0.14)", color: "#60a5fa", labelKey: "tickets.status.refunded" };
    if (s === "no_show") return { bg: "rgba(148,163,184,0.14)", color: "#c1c8d1", labelKey: "tickets.status.noshow" };
    return { bg: "rgba(148,163,184,0.14)", color: "#94a3b8", labelKey: null };
};

/* ── Icons ── */
const SearchIcon: FC = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const TicketIcon: FC = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
        <path d="M3 9a2 2 0 002-2V6a1 1 0 011-1h12a1 1 0 011 1v1a2 2 0 000 4v1a2 2 0 000 4v1a1 1 0 01-1 1H6a1 1 0 01-1-1v-1a2 2 0 00-2-2z" />
        <line x1="12" y1="5" x2="12" y2="19" strokeDasharray="2 3" />
    </svg>
);

const StarIcon: FC<{ filled?: boolean }> = ({ filled }) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter" aria-hidden="true">
        <path d="M12 2L14.35 8.76L21.51 8.91L15.8 13.24L17.88 20.09L12 16L6.12 20.09L8.2 13.24L2.49 8.91L9.65 8.76Z" />
    </svg>
);

/** Simplified list card: poster + the essentials only. Full ticket/QR and
 *  price breakdown now live on the dedicated detail page (one click away)
 *  instead of expanding inline here. */
const BookingCard: FC<{ booking: MyBooking; onViewDetail: () => void; onRefund: () => void; onReview: () => void }> = ({ booking, onViewDetail, onRefund, onReview }) => {
    const { t } = useTranslation("profile");
    const st = statusStyle(booking.status);
    const refundEligible = canRequestRefund(booking.status, booking.startTime);
    const fnbOnly = isFnbOnlyBooking(booking);
    const fnbCount = booking.fnbItems.reduce((sum, i) => sum + i.quantity, 0);
    const reviewEligible = !fnbOnly && canWriteReview(booking);
    const reviewed = !fnbOnly && booking.hasReviewed;

    return (
        <div
            className={styles.card}
            onClick={onViewDetail}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onViewDetail(); }}
        >
            {fnbOnly ? (
                <div className={`${styles.posterPh} ${styles.posterFnb}`}><FnbBagIcon size={34} /></div>
            ) : booking.movie.posterUrl ? (
                <img src={booking.movie.posterUrl} alt={booking.movie.title} className={styles.poster} />
            ) : (
                <div className={styles.posterPh}><FilmClapperIcon size={30} /></div>
            )}

            <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                    <div className={styles.movieTitle}>{fnbOnly ? t("tickets.fnbOrder") : booking.movie.title}</div>
                    <span className={styles.statusBadge} style={{ background: st.bg, color: st.color }}>
                        {st.labelKey ? t(st.labelKey) : booking.status}
                    </span>
                </div>

                {fnbOnly ? (
                    <div className={styles.meta}>
                        {t("tickets.fnbMeta", { count: fnbCount })}
                    </div>
                ) : (
                    <>
                        {booking.startTime && (
                            <div className={styles.meta}>{formatDateTime(booking.startTime)}</div>
                        )}
                        {(booking.cinemaName || booking.roomName) && (
                            <div className={styles.metaSub}>
                                {booking.cinemaName}{booking.cinemaName && booking.roomName ? " · " : ""}{booking.roomName}
                            </div>
                        )}
                    </>
                )}

                {booking.purchaseReward && booking.purchaseReward.points > 0 && (
                    booking.purchaseReward.earned ? (
                        <div className={`${styles.rewardLine} ${styles.rewardLineEarned}`}>
                            <CheckCircleIcon size={13} /> {t("tickets.rewardEarned", { points: formatNumber(booking.purchaseReward.points) })}
                        </div>
                    ) : (
                        <div className={styles.rewardLine}>
                            {t("tickets.rewardPending", { points: formatNumber(booking.purchaseReward.points) })}
                        </div>
                    )
                )}

                <div className={styles.cardBottom}>
                    <span className={styles.price}>{formatVnd(booking.finalAmount)}</span>
                    <div className={styles.actions}>
                        {reviewed && (
                            <span className={styles.reviewedPill}>
                                <StarIcon filled /> {t("tickets.reviewed")}
                            </span>
                        )}
                        {reviewEligible && (
                            <Button
                                className={styles.reviewBtn}
                                icon={<StarIcon />}
                                onClick={(e) => { e.stopPropagation(); onReview(); }}
                            >
                                {t("tickets.writeReview")}
                                {booking.reviewReward && booking.reviewReward.points > 0
                                    ? ` · +${formatNumber(booking.reviewReward.points)} ${t("tickets.pts")}`
                                    : ""}
                            </Button>
                        )}
                        {refundEligible && (
                            <Button
                                className={styles.refundBtn}
                                onClick={(e) => { e.stopPropagation(); onRefund(); }}
                            >
                                {t("tickets.requestRefund")}
                            </Button>
                        )}
                        <Button
                            className={styles.detailBtn}
                            onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
                        >
                            {t("tickets.viewDetail")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SkeletonCard: FC = () => (
    <div className={styles.skeletonCard}>
        <div className={styles.skeletonBlock} style={{ width: 68, height: 100, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <div className={styles.skeletonBlock} style={{ height: 16, width: "60%" }} />
            <div className={styles.skeletonBlock} style={{ height: 12, width: "40%" }} />
            <div className={styles.skeletonBlock} style={{ height: 12, width: "35%" }} />
        </div>
    </div>
);

const MyTicketsPage: FC = () => {
    const { t } = useTranslation("profile");
    const navigate = useNavigate();
    const { data: bookings = [], isLoading, isError, refetch } = useMyBookings();
    const [refundTarget, setRefundTarget] = useState<RefundBookingInfo | null>(null);
    const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);
    const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "past" | "toReview">("all");
    const [page, setPage] = useState(1);

    const visible = useMemo(
        () => bookings.filter((b) => !HIDDEN_STATUSES.has(b.status.toLowerCase())),
        [bookings],
    );

    // Upcoming = still-to-be-watched (Paid); everything else (used, no_show,
    // refunded, pending…) counts as past.
    const isUpcoming = (b: MyBooking) => b.status.toLowerCase() === "paid";

    const stats = useMemo(() => {
        return {
            total: visible.length,
            upcoming: visible.filter(isUpcoming).length,
            past: visible.filter((b) => !isUpcoming(b)).length,
        };
    }, [visible]);

    const pendingReviews = useMemo(
        () => visible.filter((b) => !isFnbOnlyBooking(b) && canWriteReview(b)).length,
        [visible],
    );

    const filtered = useMemo(() => {
        let r = [...visible].sort(
            (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
        );
        const q = search.trim().toLowerCase();
        if (q) r = r.filter((b) => b.movie.title.toLowerCase().includes(q));
        if (dateFilter) {
            const target = dateFilter.format("YYYY-MM-DD");
            r = r.filter((b) => dayjs(b.startTime).format("YYYY-MM-DD") === target);
        }
        if (statusFilter === "upcoming") r = r.filter(isUpcoming);
        if (statusFilter === "past") r = r.filter((b) => !isUpcoming(b));
        if (statusFilter === "toReview") r = r.filter((b) => !isFnbOnlyBooking(b) && canWriteReview(b));
        return r;
    }, [visible, search, dateFilter, statusFilter]);

    const paged = useMemo(
        () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [filtered, page],
    );

    const hasFilters = search.trim() !== "" || dateFilter != null || statusFilter !== "all";
    const isFilterEmpty = !isLoading && !isError && visible.length > 0 && filtered.length === 0;
    const isEmpty = !isLoading && !isError && visible.length === 0;

    const clearFilters = () => {
        setSearch("");
        setDateFilter(null);
        setStatusFilter("all");
        setPage(1);
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{t("nav.tickets")}</h1>
                    <p className={styles.subtitle}>
                        {t("tickets.subtitle")}
                    </p>
                </div>
                {!isLoading && !isError && visible.length > 0 && (
                    <div className={styles.statsRow}>
                        <div className={styles.statPill}>
                            <span className={styles.statPillDot} style={{ background: "#9ca3af" }} />
                            <span className={styles.statPillValue}>{stats.total}</span>
                            <span className={styles.statPillLabel}>{t("tickets.statTotal")}</span>
                        </div>
                        <div className={styles.statPill}>
                            <span className={styles.statPillDot} style={{ background: "#4ade80" }} />
                            <span className={styles.statPillValue}>{stats.upcoming}</span>
                            <span className={styles.statPillLabel}>{t("tickets.statUpcoming")}</span>
                        </div>
                        <div className={styles.statPill}>
                            <span className={styles.statPillDot} style={{ background: "#60a5fa" }} />
                            <span className={styles.statPillValue}>{stats.past}</span>
                            <span className={styles.statPillLabel}>{t("tickets.statPast")}</span>
                        </div>
                    </div>
                )}
            </div>

            {!isLoading && !isError && pendingReviews > 0 && statusFilter !== "toReview" && (
                <div className={styles.reviewBanner}>
                    <span className={styles.reviewBannerIcon}>
                        <StarIcon filled />
                    </span>
                    <span className={styles.reviewBannerText}>
                        <Trans
                            t={t}
                            i18nKey="tickets.reviewBanner"
                            count={pendingReviews}
                            components={{ bold: <strong /> }}
                        />
                    </span>
                    <button
                        type="button"
                        className={styles.reviewBannerBtn}
                        onClick={() => { setStatusFilter("toReview"); setPage(1); }}
                    >
                        {t("tickets.reviewNow")}
                    </button>
                </div>
            )}

            {!isLoading && !isError && visible.length > 0 && (
                <div className={styles.toolbar}>
                    <Input
                        className={styles.searchInput}
                        prefix={<SearchIcon />}
                        placeholder={t("tickets.searchPlaceholder")}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        allowClear
                    />
                    <div className={styles.statusFilterGroup}>
                        {(["all", "upcoming", "past", "toReview"] as const).map((key) => (
                            <button
                                key={key}
                                type="button"
                                className={`${styles.statusFilterBtn} ${statusFilter === key ? styles.statusFilterBtnActive : ""}`}
                                onClick={() => { setStatusFilter(key); setPage(1); }}
                            >
                                {key === "all" ? t("tickets.filterAll")
                                    : key === "upcoming" ? t("tickets.statUpcoming")
                                        : key === "past" ? t("tickets.statPast")
                                            : t("tickets.filterToReview")}
                                {key === "toReview" && pendingReviews > 0 && (
                                    <span className={styles.filterCount}>{pendingReviews}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <DatePicker
                        className={styles.datePicker}
                        classNames={{ popup: { root: styles.datePickerPopup } }}
                        placeholder={t("tickets.dateFilterPlaceholder")}
                        value={dateFilter}
                        onChange={(v) => { setDateFilter(v); setPage(1); }}
                        format="DD/MM/YYYY"
                        allowClear
                    />
                    {hasFilters && (
                        <Button type="text" className={styles.clearBtn} onClick={clearFilters}>
                            {t("tickets.clearFilters")}
                        </Button>
                    )}
                </div>
            )}

            {isLoading ? (
                <div className={styles.list}>
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : isError ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateText}>{t("tickets.loadFailed")}</p>
                    <Button className={styles.detailBtn} onClick={() => refetch()}>{t("common:actions.tryAgain")}</Button>
                </div>
            ) : isEmpty ? (
                <div className={styles.stateBox}>
                    <div style={{ color: "#5a4040", marginBottom: 12 }}><TicketIcon /></div>
                    <p className={styles.stateTitle}>{t("tickets.emptyTitle")}</p>
                    <p className={styles.stateText}>{t("tickets.emptyText")}</p>
                    <Button className={styles.primaryBtn} onClick={() => navigate("/customer")}>
                        {t("tickets.browseMovies")}
                    </Button>
                </div>
            ) : isFilterEmpty ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>{t("tickets.noResultsTitle")}</p>
                    <p className={styles.stateText}>{t("tickets.noResultsText")}</p>
                    <Button className={styles.detailBtn} onClick={clearFilters}>{t("tickets.clearFilters")}</Button>
                </div>
            ) : (
                <>
                    <div className={styles.list}>
                        {paged.map((b) => (
                            <BookingCard
                                key={b.bookingID}
                                booking={b}
                                onViewDetail={() => navigate(`/customer/profile/tickets/${b.bookingID}`)}
                                onRefund={() =>
                                    setRefundTarget({
                                        bookingID: b.bookingID,
                                        bookingCode: b.bookingCode,
                                        movieTitle: b.movie.title,
                                        finalAmount: b.finalAmount,
                                    })
                                }
                                onReview={() =>
                                    setReviewTarget({
                                        bookingID: b.bookingID,
                                        movieTitle: b.movie.title,
                                        posterUrl: b.movie.posterUrl,
                                        subtitle: b.startTime ? formatDateTime(b.startTime) : undefined,
                                    })
                                }
                            />
                        ))}
                    </div>

                    {filtered.length > PAGE_SIZE && (
                        <Pagination
                            className={styles.pagination}
                            current={page}
                            pageSize={PAGE_SIZE}
                            total={filtered.length}
                            onChange={setPage}
                            showSizeChanger={false}
                        />
                    )}
                </>
            )}

            <RefundModal open={refundTarget != null} booking={refundTarget} onClose={() => setRefundTarget(null)} />
            <ReviewModal open={reviewTarget != null} booking={reviewTarget} onClose={() => setReviewTarget(null)} />
        </div>
    );
};

export default MyTicketsPage;
