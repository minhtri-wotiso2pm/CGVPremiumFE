import { type FC, useEffect, useMemo, useRef, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import type { ManagerShowtime } from "../../types/showtime-mgmt.types";

/* Visible window of the day. Data runs ~07:00–24:00; 6→24 gives padding. */
const START_HOUR = 6;
const END_HOUR = 24;
const HOUR_H = 54; // px per hour
const TOTAL_MIN = (END_HOUR - START_HOUR) * 60;
const PX_PER_MIN = HOUR_H / 60;

const STATUS_CLASS: Record<string, string> = {
    scheduled: "cal-ev--scheduled",
    completed: "cal-ev--completed",
    cancelled: "cal-ev--cancelled",
};

const clamp = (m: number) => Math.max(0, Math.min(TOTAL_MIN, m));

/** Minutes from the top of the visible window, clamped to it. */
const minutesFromTop = (iso: string): number =>
    clamp((dayjs(iso.slice(0, 19)).hour() - START_HOUR) * 60 + dayjs(iso.slice(0, 19)).minute());

interface Positioned {
    ev: ManagerShowtime;
    top: number;
    height: number;
    colIndex: number;
    colCount: number;
}

/** Assign overlapping showtimes to side-by-side sub-columns (greedy). */
function layoutDay(events: ManagerShowtime[]): Positioned[] {
    const sorted = [...events].sort(
        (a, b) => minutesFromTop(a.startTime) - minutesFromTop(b.startTime),
    );
    const spans = sorted.map((ev) => {
        const startD = dayjs(ev.startTime.slice(0, 19));
        const top = clamp((startD.hour() - START_HOUR) * 60 + startD.minute());
        let end: number;
        if (ev.endTime) {
            const endD = dayjs(ev.endTime.slice(0, 19));
            // A show ending on a later calendar day crosses midnight → pin to bottom.
            end = endD.isAfter(startD, "day")
                ? TOTAL_MIN
                : clamp((endD.hour() - START_HOUR) * 60 + endD.minute());
        } else {
            end = clamp(top + 60);
        }
        if (end <= top) end = Math.min(TOTAL_MIN, top + 30);
        const height = Math.max(22, end - top);
        return { ev, top, bottom: top + height, height };
    });

    const result: Positioned[] = [];
    let cluster: typeof spans = [];
    let clusterEnd = -1;

    const flush = () => {
        if (!cluster.length) return;
        // Greedy column assignment within the overlapping cluster.
        const colEnds: number[] = [];
        const assigned = cluster.map((s) => {
            let col = colEnds.findIndex((end) => end <= s.top);
            if (col === -1) { col = colEnds.length; colEnds.push(s.bottom); }
            else colEnds[col] = s.bottom;
            return { s, col };
        });
        const colCount = colEnds.length;
        assigned.forEach(({ s, col }) => {
            result.push({ ev: s.ev, top: s.top, height: s.height, colIndex: col, colCount });
        });
        cluster = [];
        clusterEnd = -1;
    };

    for (const s of spans) {
        if (cluster.length && s.top >= clusterEnd) flush();
        cluster.push(s);
        clusterEnd = Math.max(clusterEnd, s.bottom);
    }
    flush();
    return result;
}

interface Props {
    days: Dayjs[];
    groupedByDate: Map<string, ManagerShowtime[]>;
    onSelect: (showtime: ManagerShowtime) => void;
}

const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

const CalendarTimeGrid: FC<Props> = ({ days, groupedByDate, onSelect }) => {
    const todayKey = dayjs().format("YYYY-MM-DD");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Re-render the "now" line every minute.
    const [now, setNow] = useState(() => dayjs());
    useEffect(() => {
        const id = setInterval(() => setNow(dayjs()), 60 * 1000);
        return () => clearInterval(id);
    }, []);

    // Auto-scroll so the current hour (or 09:00) is near the top on mount.
    useEffect(() => {
        const focusHour = Math.max(START_HOUR, Math.min(now.hour() - 1, 9));
        if (scrollRef.current) {
            scrollRef.current.scrollTop = (focusHour - START_HOUR) * HOUR_H;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const layouts = useMemo(
        () => days.map((d) => layoutDay(groupedByDate.get(d.format("YYYY-MM-DD")) ?? [])),
        [days, groupedByDate],
    );

    const nowTop = (now.hour() - START_HOUR) * 60 + now.minute();
    const nowVisible = nowTop >= 0 && nowTop <= TOTAL_MIN;

    const gridCols = { gridTemplateColumns: `56px repeat(${days.length}, minmax(120px, 1fr))` };
    const isSingle = days.length === 1;

    return (
        <div className={`cal-tg${isSingle ? " cal-tg--single" : ""}`}>
            <div className="cal-tg__scroll" ref={scrollRef}>
                <div className="cal-tg__header" style={gridCols}>
                    <div className="cal-tg__corner" />
                    {days.map((d) => {
                        const isToday = d.format("YYYY-MM-DD") === todayKey;
                        return (
                            <div className={`cal-tg__dayhead${isToday ? " cal-tg__dayhead--today" : ""}`} key={d.format("YYYY-MM-DD")}>
                                <span className="cal-tg__dayname">{d.format("ddd")}</span>
                                <span className="cal-tg__daynum">{d.format("DD")}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="cal-tg__body" style={{ ...gridCols, height: TOTAL_MIN * PX_PER_MIN }}>
                    <div className="cal-tg__gutter">
                        {hours.map((h) => (
                            <span
                                key={h}
                                className="cal-tg__hourlabel"
                                style={{ top: (h - START_HOUR) * HOUR_H }}
                            >
                                {h === 24 ? "00:00" : `${String(h).padStart(2, "0")}:00`}
                            </span>
                        ))}
                    </div>

                    {days.map((d, di) => {
                        const key = d.format("YYYY-MM-DD");
                        const isToday = key === todayKey;
                        return (
                            <div className={`cal-tg__col${isToday ? " cal-tg__col--today" : ""}`} key={key}>
                                {hours.slice(0, -1).map((h) => (
                                    <div key={h} className="cal-tg__hourline" style={{ top: (h - START_HOUR) * HOUR_H }} />
                                ))}

                                {layouts[di].map((p) => {
                                    const gap = 2;
                                    const widthPct = 100 / p.colCount;
                                    const start = dayjs(p.ev.startTime.slice(0, 19));
                                    const end = p.ev.endTime ? dayjs(p.ev.endTime.slice(0, 19)) : null;
                                    const short = p.height < 42;
                                    return (
                                        <button
                                            type="button"
                                            key={p.ev.showtimeId}
                                            className={`cal-ev ${STATUS_CLASS[p.ev.status] ?? "cal-ev--scheduled"}${short ? " cal-ev--short" : ""}`}
                                            style={{
                                                top: p.top * PX_PER_MIN,
                                                height: p.height * PX_PER_MIN - 2,
                                                left: `calc(${p.colIndex * widthPct}% + 2px)`,
                                                width: `calc(${widthPct}% - ${gap + 2}px)`,
                                            }}
                                            onClick={() => onSelect(p.ev)}
                                            title={`${p.ev.movie.title} · ${start.format("HH:mm")}${end ? `–${end.format("HH:mm")}` : ""} · ${p.ev.room.roomName}`}
                                        >
                                            <span className="cal-ev__time">
                                                {start.format("HH:mm")}{end && !short ? `–${end.format("HH:mm")}` : ""}
                                            </span>
                                            <span className="cal-ev__title">{p.ev.movie.title}</span>
                                            {!short && <span className="cal-ev__room">{p.ev.room.roomName}</span>}
                                        </button>
                                    );
                                })}

                                {isToday && nowVisible && (
                                    <div className="cal-tg__now" style={{ top: nowTop * PX_PER_MIN }}>
                                        <span className="cal-tg__now-dot" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarTimeGrid;
