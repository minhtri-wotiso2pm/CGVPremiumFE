import { type FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Select, Tooltip } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useAppSelector } from "@/store/hooks";
import { useProfile } from "@/features/customer/hooks/useProfile";
import { useMovieList } from "../hooks/useMovieList";
import { useRooms } from "../hooks/useRooms";
import { useCalendarShowtimes } from "../hooks/useCalendarShowtimes";
import { groupByDate } from "../utils/calendar.utils";
import type { ManagerShowtime } from "../types/showtime-mgmt.types";
import { SHOWTIME_STATUS_FILTER_OPTIONS } from "../constants/showtime-mgmt.constants";
import CalendarDayView from "../components/calendar/CalendarDayView";
import CalendarWeekView from "../components/calendar/CalendarWeekView";
import CalendarMonthView from "../components/calendar/CalendarMonthView";
import CalendarTimeGrid from "../components/calendar/CalendarTimeGrid";
import ShowtimeDetailModal from "../components/calendar/ShowtimeDetailModal";
import ShowtimeModal from "../components/ShowtimeModal";
import DeleteShowtimeModal from "../components/DeleteShowtimeModal";
import "./showtimeType.css";
import "./showtimeCalendar.css";

type ViewMode = "day" | "week" | "month";

const ChevronLeftIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);
const ChevronRightIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
);

const RANGE_UNIT: Record<ViewMode, "day" | "week" | "month"> = { day: "day", week: "week", month: "month" };

const ShowtimeCalendarPage: FC = () => {
    useProfile();
    const user = useAppSelector((s) => s.auth.user);
    const cinemaId = user?.cinema?.cinemaId ?? null;

    const [viewMode, setViewMode] = useState<ViewMode>("week");
    const [anchor, setAnchor] = useState(() => dayjs());
    const [filterMovie, setFilterMovie] = useState<number | null>(null);
    const [filterRoom, setFilterRoom] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState("");
    const [selected, setSelected] = useState<ManagerShowtime | null>(null);
    const [editTarget, setEditTarget] = useState<ManagerShowtime | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ManagerShowtime | null>(null);
    const [moreDay, setMoreDay] = useState<{ date: Dayjs; items: ManagerShowtime[] } | null>(null);

    const range = useMemo<[Dayjs, Dayjs]>(() => {
        if (viewMode === "day") return [anchor, anchor];
        if (viewMode === "week") return [anchor.startOf("week"), anchor.endOf("week")];
        return [anchor.startOf("month").startOf("week"), anchor.endOf("month").endOf("week")];
    }, [viewMode, anchor]);

    const { items, isLoading, isError, refetchAll } = useCalendarShowtimes(range, cinemaId);

    const { data: movieData } = useMovieList();
    const { data: allRooms = [] } = useRooms();
    const rooms = allRooms.filter((r) => r.cinemaId === cinemaId);

    const filteredItems = useMemo(() => items.filter((s) => (
        (!filterMovie || s.movie.movieId === filterMovie) &&
        (!filterRoom || s.room.roomId === filterRoom) &&
        (!filterStatus || s.status === filterStatus)
    )), [items, filterMovie, filterRoom, filterStatus]);

    const groupedByDate = useMemo(() => groupByDate(filteredItems), [filteredItems]);

    const goPrev = () => setAnchor((a) => a.subtract(1, RANGE_UNIT[viewMode]));
    const goNext = () => setAnchor((a) => a.add(1, RANGE_UNIT[viewMode]));
    const goToday = () => setAnchor(dayjs());

    const rangeLabel = useMemo(() => {
        if (viewMode === "day") return anchor.format("dddd, DD MMMM YYYY");
        if (viewMode === "week") return `${range[0].format("DD MMM")} – ${range[1].format("DD MMM YYYY")}`;
        return anchor.format("MMMM YYYY");
    }, [viewMode, anchor, range]);

    return (
        <div className="dash-fade-in">
            <div className="dash-page-header" style={{ marginBottom: 20 }}>
                <div >
                    <h1 className="dash-page-title">Showtime Calendar</h1>
                    <p className="dash-page-sub">
                        Visual schedule of all showtimes{user?.cinema ? ` for ${user.cinema.cinemaName}` : ""}.
                    </p>
                </div>
            </div>

            {!cinemaId && !isLoading ? (
                <div className="dash-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--dash-text-2)" }}>
                        Your account is not assigned to a cinema yet. Please contact an administrator.
                    </p>
                </div>
            ) : (
                <>
                    <div className="dash-toolbar">
                        <div className="dash-toolbar__left">
                            <Select
                                value={filterMovie ?? "all"}
                                onChange={(v) => setFilterMovie(v === "all" ? null : Number(v))}
                                style={{ width: 200 }}
                                showSearch
                                optionFilterProp="label"
                                options={[
                                    { value: "all", label: "All Movies" },
                                    ...(movieData?.items ?? []).map((m) => ({ value: m.movieId, label: m.title })),
                                ]}
                            />
                            <Select
                                value={filterRoom ?? "all"}
                                onChange={(v) => setFilterRoom(v === "all" ? null : Number(v))}
                                style={{ width: 160 }}
                                options={[
                                    { value: "all", label: "All Rooms" },
                                    ...rooms.map((r) => ({ value: r.roomId, label: r.name })),
                                ]}
                            />
                            <Select
                                value={filterStatus || "All"}
                                onChange={(v) => setFilterStatus(v === "all" ? "" : v)}
                                style={{ width: 150 }}
                                options={[...SHOWTIME_STATUS_FILTER_OPTIONS]}
                            />
                        </div>
                        <div className="dash-toolbar__right">
                            <div className="cal-view-toggle">
                                {(["day", "week", "month"] as ViewMode[]).map((mode) => (
                                    <button
                                        key={mode}
                                        className={`cal-view-toggle__btn${viewMode === mode ? " cal-view-toggle__btn--active" : ""}`}
                                        onClick={() => setViewMode(mode)}
                                    >
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="cal-nav">
                        <div className="cal-nav__left">
                            <Tooltip title="Previous">
                                <button className="dash-icon-btn" onClick={goPrev} aria-label="Previous"><ChevronLeftIcon /></button>
                            </Tooltip>
                            <button className="stt-btn stt-btn--ghost" onClick={goToday}>Today</button>
                            <Tooltip title="Next">
                                <button className="dash-icon-btn" onClick={goNext} aria-label="Next"><ChevronRightIcon /></button>
                            </Tooltip>
                        </div>
                        <span className="cal-nav__label">{rangeLabel}</span>
                        <div className="cal-legend">
                            <span className="cal-legend__item"><span className="cal-legend__dot cal-legend__dot--scheduled" />Scheduled</span>
                            <span className="cal-legend__item"><span className="cal-legend__dot cal-legend__dot--completed" />Completed</span>
                            <span className="cal-legend__item"><span className="cal-legend__dot cal-legend__dot--cancelled" />Cancelled</span>
                        </div>
                    </div>

                    {isError ? (
                        <div className="dash-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                            <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "var(--dash-text-1)" }}>
                                Failed to load the calendar
                            </p>
                            <button className="stt-btn stt-btn--primary" onClick={refetchAll}>Retry</button>
                        </div>
                    ) : (
                        <div className={`dash-card cal-surface${isLoading ? " cal-surface--loading" : ""}`}>
                            {viewMode === "day" && (
                                <CalendarTimeGrid
                                    days={[anchor]}
                                    groupedByDate={groupedByDate}
                                    onSelect={setSelected}
                                />
                            )}
                            {viewMode === "week" && (
                                <CalendarWeekView
                                    weekStart={range[0]}
                                    groupedByDate={groupedByDate}
                                    onSelect={setSelected}
                                />
                            )}
                            {viewMode === "month" && (
                                <CalendarMonthView
                                    monthStart={anchor.startOf("month")}
                                    groupedByDate={groupedByDate}
                                    onSelect={setSelected}
                                    onShowMore={(date, dayItems) => setMoreDay({ date, items: dayItems })}
                                />
                            )}
                        </div>
                    )}
                </>
            )}

            <ShowtimeDetailModal
                showtime={selected}
                onClose={() => setSelected(null)}
                onEdit={(s) => { setSelected(null); setEditTarget(s); }}
                onDelete={(s) => { setSelected(null); setDeleteTarget(s); }}
            />

            {cinemaId && (
                <>
                    <ShowtimeModal
                        mode="edit"
                        showtime={editTarget}
                        cinemaId={cinemaId}
                        open={editTarget != null}
                        onClose={() => setEditTarget(null)}
                    />
                    <DeleteShowtimeModal
                        showtime={deleteTarget}
                        open={deleteTarget != null}
                        onClose={() => setDeleteTarget(null)}
                    />
                </>
            )}

            {moreDay && createPortal(
                <div className="stt-modal-overlay" onClick={() => setMoreDay(null)}>
                    <div className="stt-modal stt-modal--sm" onClick={(e) => e.stopPropagation()}>
                        <div className="stt-modal__header">
                            <h2 className="stt-modal__title">{moreDay.date.format("dddd, DD MMM")}</h2>
                            <button className="stt-modal__close" onClick={() => setMoreDay(null)} aria-label="Close">×</button>
                        </div>
                        <div className="stt-modal__body">
                            <CalendarDayView date={moreDay.date} items={moreDay.items} onSelect={(s) => { setMoreDay(null); setSelected(s); }} />
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
};

export default ShowtimeCalendarPage;
