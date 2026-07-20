import { type FC, useEffect, useMemo } from "react";
import { Modal, Form, Select, DatePicker, InputNumber } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useMovieList } from "../hooks/useMovieList";
import { useRooms } from "../hooks/useRooms";
import { useRoomTypes } from "../hooks/useRoomTypes";
import { useCreateShowtime, useUpdateShowtime } from "../hooks/useManagerShowtimes";
import { SHOWTIME_STATUS_OPTIONS } from "../constants/showtime-mgmt.constants";
import { MOVIE_STATUS_META, SCHEDULABLE_MOVIE_STATUSES } from "../types/movie-mgmt.types";
import type {
    ManagerShowtime,
    CreateShowtimePayload,
    UpdateShowtimePayload,
} from "../types/showtime-mgmt.types";

/** Treat the picked wall-clock as Vietnam time regardless of browser tz. */
const toVnIso = (d: Dayjs) => `${d.format("YYYY-MM-DDTHH:mm:ss")}+07:00`;
const fromVnIso = (s: string) => dayjs(s.slice(0, 19));

const PRICE_PRESETS = [45000, 70000, 90000, 120000];

const MovieStatusPill: FC<{ status?: string }> = ({ status }) => {
    const meta = MOVIE_STATUS_META[status ?? ""] ?? null;
    if (!meta) return null;
    return (
        <span
            style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 10.5, fontWeight: 700, padding: "2px 8px",
                borderRadius: 100, background: meta.bg, color: meta.color,
                whiteSpace: "nowrap", flexShrink: 0,
            }}
        >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color }} />
            {meta.label}
        </span>
    );
};

interface Props {
    mode: "create" | "edit";
    showtime?: ManagerShowtime | null;
    cinemaId: number;
    open: boolean;
    onClose: () => void;
    /** Fired with the freshly-created showtime so the table can highlight it. */
    onCreated?: (created: ManagerShowtime) => void;
}

interface FormValues {
    movieId: number;
    roomId: number;
    startTime: Dayjs;
    basePrice: number;
    status?: string;
}

const ShowtimeModal: FC<Props> = ({ mode, showtime, cinemaId, open, onClose, onCreated }) => {
    const [form] = Form.useForm<FormValues>();
    const isEdit = mode === "edit";

    const { data: movieData } = useMovieList();
    const { data: allRooms = [] } = useRooms();
    const { data: roomTypes = [] } = useRoomTypes();
    const { mutate: create, isPending: creating } = useCreateShowtime();
    const { mutate: update, isPending: updating } = useUpdateShowtime();
    const isLoading = creating || updating;

    const selectedMovieId = Form.useWatch("movieId", form);
    const selectedStartTime = Form.useWatch("startTime", form);

    /** Create only offers schedulable movies (now showing / coming soon).
     *  Edit keeps every movie so an existing showtime on an ended movie is
     *  never silently unset when reopened. */
    const movieOptions = useMemo(() => {
        const all = movieData?.items ?? [];
        const source = isEdit
            ? all
            : all.filter((m) => SCHEDULABLE_MOVIE_STATUSES.includes(m.status));
        return source.map((m) => ({
            value: m.movieId,
            label: m.title,
            posterUrl: m.posterUrl,
            status: m.status,
        }));
    }, [movieData, isEdit]);

    const selectedMovie = useMemo(
        () => (movieData?.items ?? []).find((m) => m.movieId === selectedMovieId) ?? null,
        [movieData, selectedMovieId],
    );

    const roomTypeName = useMemo(() => {
        const map = new Map<number, string>();
        roomTypes.forEach((rt) => map.set(rt.roomTypeId, rt.typeName));
        return map;
    }, [roomTypes]);

    const roomOptions = useMemo(
        () => allRooms
            .filter((r) => r.cinemaId === cinemaId && r.status === "ACTIVE")
            .map((r) => {
                const typeName = roomTypeName.get(r.roomTypeId);
                const base = typeName ? `${r.name} · ${typeName}` : r.name;
                return { value: r.roomId, label: `${base} · ${r.capacity} seats` };
            }),
        [allRooms, cinemaId, roomTypeName],
    );

    /** Estimated end time = start + movie duration (preview only; the server
     *  is the source of truth). */
    const estimatedEnd = useMemo(() => {
        if (!selectedStartTime || !selectedMovie?.durationMinutes) return null;
        return selectedStartTime.add(selectedMovie.durationMinutes, "minute");
    }, [selectedStartTime, selectedMovie]);

    useEffect(() => {
        if (open) {
            if (isEdit && showtime) {
                form.setFieldsValue({
                    movieId: showtime.movie.movieId,
                    roomId: showtime.room.roomId,
                    startTime: fromVnIso(showtime.startTime),
                    basePrice: showtime.basePrice,
                    status: showtime.status,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ basePrice: 90000 });
            }
        }
    }, [open, isEdit, showtime, form]);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        if (isEdit && showtime) {
            const payload: UpdateShowtimePayload = {
                movieId: values.movieId,
                roomId: values.roomId,
                startTime: toVnIso(values.startTime),
                basePrice: values.basePrice,
                status: values.status,
            };
            update({ showtimeId: showtime.showtimeId, payload }, { onSuccess: onClose });
        } else {
            const payload: CreateShowtimePayload = {
                movieId: values.movieId,
                roomId: values.roomId,
                startTime: toVnIso(values.startTime),
                basePrice: values.basePrice,
            };
            create(payload, {
                onSuccess: (created) => {
                    onCreated?.(created);
                    onClose();
                },
            });
        }
    };

    return (
        <Modal
            title={isEdit ? "Edit Showtime" : "Add New Showtime"}
            open={open}
            onOk={handleSubmit}
            onCancel={() => { if (!isLoading) onClose(); }}
            okText={isEdit ? "Save Changes" : "Create Showtime"}
            cancelText="Cancel"
            confirmLoading={isLoading}
            maskClosable={!isLoading}
            width={480}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 4 }}>
                <Form.Item label="Movie" name="movieId" rules={[{ required: true, message: "Please select a movie" }]}>
                    <Select
                        placeholder="Select a movie"
                        options={movieOptions}
                        showSearch
                        optionFilterProp="label"
                        notFoundContent={
                            isEdit ? "No movies" : "No now-showing or coming-soon movies"
                        }
                        optionRender={(option) => (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {option.data.posterUrl ? (
                                    <img
                                        src={option.data.posterUrl}
                                        alt=""
                                        style={{ width: 24, height: 36, objectFit: "cover", borderRadius: 3, flexShrink: 0 }}
                                    />
                                ) : (
                                    <div style={{ width: 24, height: 36, borderRadius: 3, background: "rgba(0,0,0,0.08)", flexShrink: 0 }} />
                                )}
                                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {option.data.label}
                                </span>
                                <MovieStatusPill status={option.data.status} />
                            </div>
                        )}
                    />
                </Form.Item>

                {selectedMovie && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: 12,
                            marginTop: -12,
                            marginBottom: 24,
                            background: "rgba(0,0,0,0.03)",
                            border: "1px solid rgba(0,0,0,0.06)",
                            borderRadius: 8,
                        }}
                    >
                        {selectedMovie.posterUrl ? (
                            <img
                                src={selectedMovie.posterUrl}
                                alt={selectedMovie.title}
                                style={{ width: 52, height: 78, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
                            />
                        ) : (
                            <div style={{ width: 52, height: 78, borderRadius: 4, flexShrink: 0, background: "rgba(0,0,0,0.08)" }} />
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 14, fontWeight: 700 }}>{selectedMovie.title}</span>
                                <MovieStatusPill status={selectedMovie.status} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
                                {selectedMovie.ageRating && <span>{selectedMovie.ageRating}</span>}
                                {selectedMovie.durationMinutes ? <span>{selectedMovie.durationMinutes} min</span> : null}
                            </div>
                            {selectedMovie.genres && selectedMovie.genres.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                    {selectedMovie.genres.map((g) => (
                                        <span
                                            key={g}
                                            style={{
                                                fontSize: 10.5,
                                                fontWeight: 600,
                                                padding: "2px 8px",
                                                borderRadius: 100,
                                                background: "rgba(232,0,28,0.08)",
                                                color: "#b50016",
                                            }}
                                        >
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <Form.Item label="Room" name="roomId" rules={[{ required: true, message: "Please select a room" }]}>
                    <Select
                        placeholder={roomOptions.length ? "Select a room" : "No active rooms — create one first"}
                        options={roomOptions}
                        showSearch
                        optionFilterProp="label"
                    />
                </Form.Item>

                <Form.Item
                    label="Start Time"
                    name="startTime"
                    rules={[{ required: true, message: "Please select a start time" }]}
                    tooltip="Interpreted as Vietnam time (UTC+7)."
                    extra={
                        estimatedEnd ? (
                            <span style={{ fontSize: 12, color: "var(--dash-text-2, rgba(0,0,0,0.55))" }}>
                                Estimated end ~ <strong>{estimatedEnd.format("HH:mm")}</strong> ({selectedMovie?.durationMinutes} min)
                            </span>
                        ) : selectedStartTime && selectedMovie && !selectedMovie.durationMinutes ? (
                            <span style={{ fontSize: 12, color: "#C2620A" }}>
                                This movie has no duration set — end time can't be estimated.
                            </span>
                        ) : null
                    }
                >
                    <DatePicker
                        showTime={{ format: "HH:mm" }}
                        format="DD/MM/YYYY HH:mm"
                        style={{ width: "100%" }}
                        minuteStep={5}
                    />
                </Form.Item>

                <Form.Item label="Base Price (VND)" name="basePrice" rules={[{ required: true, message: "Base price is required" }, { type: "number", min: 0, message: "Cannot be negative" }]}>
                    <InputNumber
                        min={0}
                        step={1000}
                        style={{ width: "100%" }}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(v) => Number((v ?? "").replace(/,/g, "")) as 0}
                    />
                </Form.Item>
                <div style={{ display: "flex", gap: 6, marginTop: -16, marginBottom: 20, flexWrap: "wrap" }}>
                    {PRICE_PRESETS.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => form.setFieldValue("basePrice", p)}
                            style={{
                                fontSize: 11.5, fontWeight: 600, padding: "3px 10px",
                                borderRadius: 100, cursor: "pointer",
                                border: "1px solid rgba(0,0,0,0.1)",
                                background: "rgba(0,0,0,0.02)", color: "rgba(0,0,0,0.65)",
                            }}
                        >
                            {p.toLocaleString("vi-VN")} ₫
                        </button>
                    ))}
                </div>

                {isEdit && (
                    <Form.Item label="Status" name="status" rules={[{ required: true, message: "Please select a status" }]}>
                        <Select options={[...SHOWTIME_STATUS_OPTIONS]} />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default ShowtimeModal;
