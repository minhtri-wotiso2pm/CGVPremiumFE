import { type FC, useMemo, useState } from "react";
import { Alert, Skeleton } from "antd";
import dayjs from "dayjs";
import { useCounterShowtimes } from "../../hooks/useCounterShowtimes";
import type { ManagerShowtime } from "@/features/manager/types/showtime-mgmt.types";
import type { CounterShowtime } from "../../types/counter.types";
import { FilmIcon } from "./icons";
import styles from "./counter.module.css";

const DAY_COUNT = 11;

interface Props {
    cinemaId: number | undefined;
    cinemaName: string;
    onSelect: (showtime: CounterShowtime) => void;
}

interface MovieGroup {
    movieId: number;
    title: string;
    posterUrl: string | null;
    showtimes: ManagerShowtime[];
}

const groupByMovie = (items: ManagerShowtime[]): MovieGroup[] => {
    const map = new Map<number, MovieGroup>();
    for (const st of items) {
        const id = st.movie.movieId;
        if (!map.has(id)) {
            map.set(id, { movieId: id, title: st.movie.title, posterUrl: st.movie.posterUrl ?? null, showtimes: [] });
        }
        map.get(id)!.showtimes.push(st);
    }
    return Array.from(map.values());
};

const ShowtimePicker: FC<Props> = ({ cinemaId, cinemaName, onSelect }) => {
    const dates = useMemo(
        () => Array.from({ length: DAY_COUNT }, (_, i) => dayjs().add(i, "day")),
        [],
    );
    const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));

    const { data, isLoading, isError, refetch } = useCounterShowtimes(cinemaId, date);
    const groups = useMemo(() => groupByMovie(data?.items ?? []), [data]);

    const pick = (st: ManagerShowtime) => {
        onSelect({
            showtimeId: st.showtimeId,
            movieId: st.movie.movieId,
            movieTitle: st.movie.title,
            moviePoster: st.movie.posterUrl ?? null,
            startTime: st.startTime,
            endTime: st.endTime,
            roomId: st.room.roomId,
            roomName: st.room.roomName,
            roomType: st.room.roomType,
            cinemaId: cinemaId ?? 0,
            cinemaName,
        });
    };

    return (
        <div className="dash-card" style={{ padding: 24 }}>
            <div className={styles.stepHeadRow}>
                <div>
                    <h2 className={styles.stepHeadTitle}>Choose a showtime</h2>
                    <p className={styles.stepHeadSub}>{cinemaName} · movies playing on the selected day.</p>
                </div>
            </div>

            <div className={styles.dateStrip}>
                {dates.map((d) => {
                    const key = d.format("YYYY-MM-DD");
                    const active = key === date;
                    return (
                        <button
                            key={key}
                            type="button"
                            className={`${styles.dateChip} ${active ? styles.dateChipActive : ""}`}
                            onClick={() => setDate(key)}
                        >
                            <div className={styles.dateChipDow}>{d.isSame(dayjs(), "day") ? "Today" : d.format("ddd")}</div>
                            <div className={styles.dateChipDay}>{d.format("DD")}</div>
                        </button>
                    );
                })}
            </div>

            {isLoading && <Skeleton active paragraph={{ rows: 4 }} />}

            {isError && (
                <Alert
                    type="error"
                    showIcon
                    message="Couldn't load showtimes."
                    action={<button className={styles.stTime} onClick={() => refetch()}>Retry</button>}
                />
            )}

            {!isLoading && !isError && groups.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: "var(--dash-text-3)" }}>
                    <FilmIcon size={40} />
                    <p style={{ marginTop: 12, color: "var(--dash-text-2)" }}>No showtimes scheduled for this day.</p>
                </div>
            )}

            {groups.map((g) => (
                <div key={g.movieId} className={styles.stMovie}>
                    {g.posterUrl ? (
                        <img className={styles.stPoster} src={g.posterUrl} alt={g.title} loading="lazy" />
                    ) : (
                        <div className={styles.stPoster} style={{ display: "grid", placeItems: "center", color: "var(--dash-text-3)" }}>
                            <FilmIcon size={24} />
                        </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 className={styles.stMovieTitle}>{g.title}</h3>
                        <div className={styles.stTimes}>
                            {g.showtimes.map((st) => (
                                <button
                                    key={st.showtimeId}
                                    type="button"
                                    className={styles.stTime}
                                    disabled={st.isSoldOut}
                                    title={st.isSoldOut ? "Sold out" : undefined}
                                    onClick={() => pick(st)}
                                >
                                    <span>{dayjs(st.startTime).format("HH:mm")}</span>
                                    <span className={styles.stTimeRoom}>
                                        {st.room.roomName}{st.isSoldOut ? " · Full" : ""}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ShowtimePicker;
