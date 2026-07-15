import { type FC, useMemo, useState } from "react";
import { Input, DatePicker, Pagination, Button } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useMyBookings } from "@/features/booking/hooks/useMyBookings";
import type { MyBooking } from "@/features/booking/types/ticket.types";
import { canRequestRefund } from "@/features/booking/utils/refund.utils";
import RefundModal, { type RefundBookingInfo } from "@/features/booking/components/RefundModal";
import styles from "./MyTicketsPage.module.css";

const PAGE_SIZE = 10;

/** Cancelled/expired bookings never made it to a real screening — no
 *  value in surfacing them in the customer's ticket list at all. */
const HIDDEN_STATUSES = new Set(["cancelled", "expired"]);

const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const fmtDateTime = (iso: string): string => {
    try {
        const d = new Date(iso);
        const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
        const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
        return `${time}, ${date}`;
    } catch { return ""; }
};

const statusStyle = (status: string): { bg: string; color: string; label: string } => {
    const s = status.toLowerCase();
    if (s === "paid") return { bg: "rgba(34,197,94,0.14)", color: "#4ade80", label: "Paid" };
    if (s === "pending") return { bg: "rgba(245,158,11,0.14)", color: "#fbbf24", label: "Pending" };
    if (s === "refunded") return { bg: "rgba(96,165,250,0.14)", color: "#60a5fa", label: "Refunded" };
    return { bg: "rgba(148,163,184,0.14)", color: "#94a3b8", label: status };
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

/** Simplified list card: poster + the essentials only. Full ticket/QR and
 *  price breakdown now live on the dedicated detail page (one click away)
 *  instead of expanding inline here. */
const BookingCard: FC<{ booking: MyBooking; onViewDetail: () => void; onRefund: () => void }> = ({ booking, onViewDetail, onRefund }) => {
    const st = statusStyle(booking.status);
    const refundEligible = canRequestRefund(booking.status, booking.startTime);

    return (
        <div
            className={styles.card}
            onClick={onViewDetail}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onViewDetail(); }}
        >
            {booking.movie.posterUrl ? (
                <img src={booking.movie.posterUrl} alt={booking.movie.title} className={styles.poster} />
            ) : (
                <div className={styles.posterPh}>🎬</div>
            )}

            <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                    <div className={styles.movieTitle}>{booking.movie.title}</div>
                    <span className={styles.statusBadge} style={{ background: st.bg, color: st.color }}>
                        {st.label}
                    </span>
                </div>

                {booking.startTime && (
                    <div className={styles.meta}>{fmtDateTime(booking.startTime)}</div>
                )}
                {(booking.cinemaName || booking.roomName) && (
                    <div className={styles.metaSub}>
                        {booking.cinemaName}{booking.cinemaName && booking.roomName ? " · " : ""}{booking.roomName}
                    </div>
                )}

                <div className={styles.cardBottom}>
                    <span className={styles.price}>{fmtVnd(booking.finalAmount)}</span>
                    <div className={styles.actions}>
                        {refundEligible && (
                            <Button
                                className={styles.refundBtn}
                                onClick={(e) => { e.stopPropagation(); onRefund(); }}
                            >
                                Request Refund
                            </Button>
                        )}
                        <Button
                            className={styles.detailBtn}
                            onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
                        >
                            View Detail
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
    const navigate = useNavigate();
    const { data: bookings = [], isLoading, isError, refetch } = useMyBookings();
    const [refundTarget, setRefundTarget] = useState<RefundBookingInfo | null>(null);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);
    const [page, setPage] = useState(1);

    // Snapshot once on mount via useState's lazy initializer — the
    // sanctioned way to do a one-time impure computation; classifying
    // upcoming/past doesn't need to tick live.
    const [now] = useState(() => Date.now());

    const visible = useMemo(
        () => bookings.filter((b) => !HIDDEN_STATUSES.has(b.status.toLowerCase())),
        [bookings],
    );

    const stats = useMemo(() => {
        return {
            total: visible.length,
            upcoming: visible.filter((b) => new Date(b.startTime).getTime() > now).length,
            past: visible.filter((b) => new Date(b.startTime).getTime() <= now).length,
        };
    }, [visible, now]);

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
        return r;
    }, [visible, search, dateFilter]);

    const paged = useMemo(
        () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [filtered, page],
    );

    const hasFilters = search.trim() !== "" || dateFilter != null;
    const isFilterEmpty = !isLoading && !isError && visible.length > 0 && filtered.length === 0;
    const isEmpty = !isLoading && !isError && visible.length === 0;

    const clearFilters = () => {
        setSearch("");
        setDateFilter(null);
        setPage(1);
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>My Tickets</h1>
                    <p className={styles.subtitle}>
                        Your booked movies and e-tickets. Show the QR code at the cinema entrance.
                    </p>
                </div>
                {!isLoading && !isError && visible.length > 0 && (
                    <div className={styles.statsRow}>
                        <div className={styles.statPill}>
                            <span className={styles.statPillDot} style={{ background: "#9ca3af" }} />
                            <span className={styles.statPillValue}>{stats.total}</span>
                            <span className={styles.statPillLabel}>Total</span>
                        </div>
                        <div className={styles.statPill}>
                            <span className={styles.statPillDot} style={{ background: "#4ade80" }} />
                            <span className={styles.statPillValue}>{stats.upcoming}</span>
                            <span className={styles.statPillLabel}>Upcoming</span>
                        </div>
                        <div className={styles.statPill}>
                            <span className={styles.statPillDot} style={{ background: "#60a5fa" }} />
                            <span className={styles.statPillValue}>{stats.past}</span>
                            <span className={styles.statPillLabel}>Past</span>
                        </div>
                    </div>
                )}
            </div>

            {!isLoading && !isError && visible.length > 0 && (
                <div className={styles.toolbar}>
                    <Input
                        className={styles.searchInput}
                        prefix={<SearchIcon />}
                        placeholder="Search by movie title..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        allowClear
                    />
                    <DatePicker
                        className={styles.datePicker}
                        placeholder="Filter by showtime date"
                        value={dateFilter}
                        onChange={(v) => { setDateFilter(v); setPage(1); }}
                        format="DD/MM/YYYY"
                        allowClear
                    />
                    {hasFilters && (
                        <Button type="text" className={styles.clearBtn} onClick={clearFilters}>
                            Clear filters
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
                    <p className={styles.stateText}>Failed to load your tickets.</p>
                    <Button className={styles.detailBtn} onClick={() => refetch()}>Retry</Button>
                </div>
            ) : isEmpty ? (
                <div className={styles.stateBox}>
                    <div style={{ color: "#5a4040", marginBottom: 12 }}><TicketIcon /></div>
                    <p className={styles.stateTitle}>No bookings yet</p>
                    <p className={styles.stateText}>Book your first movie to see tickets here.</p>
                    <Button className={styles.primaryBtn} onClick={() => navigate("/customer")}>
                        Browse Movies
                    </Button>
                </div>
            ) : isFilterEmpty ? (
                <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>No results found</p>
                    <p className={styles.stateText}>Try adjusting your search or date filter.</p>
                    <Button className={styles.detailBtn} onClick={clearFilters}>Clear filters</Button>
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
        </div>
    );
};

export default MyTicketsPage;
