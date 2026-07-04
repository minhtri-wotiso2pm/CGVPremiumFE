import { type FC, useEffect, useMemo } from "react";
import { Modal, Form, Select, DatePicker, InputNumber } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useMovieList } from "../hooks/useMovieList";
import { useRooms } from "../hooks/useRooms";
import { useCreateShowtime, useUpdateShowtime } from "../hooks/useManagerShowtimes";
import { SHOWTIME_STATUS_OPTIONS } from "../constants/showtime-mgmt.constants";
import type {
    ManagerShowtime,
    CreateShowtimePayload,
    UpdateShowtimePayload,
} from "../types/showtime-mgmt.types";

/** Treat the picked wall-clock as Vietnam time regardless of browser tz. */
const toVnIso = (d: Dayjs) => `${d.format("YYYY-MM-DDTHH:mm:ss")}+07:00`;
const fromVnIso = (s: string) => dayjs(s.slice(0, 19));

interface Props {
    mode: "create" | "edit";
    showtime?: ManagerShowtime | null;
    cinemaId: number;
    open: boolean;
    onClose: () => void;
}

interface FormValues {
    movieId: number;
    roomId: number;
    startTime: Dayjs;
    basePrice: number;
    status?: string;
}

const ShowtimeModal: FC<Props> = ({ mode, showtime, cinemaId, open, onClose }) => {
    const [form] = Form.useForm<FormValues>();
    const isEdit = mode === "edit";

    const { data: movieData } = useMovieList();
    const { data: allRooms = [] } = useRooms();
    const { mutate: create, isPending: creating } = useCreateShowtime();
    const { mutate: update, isPending: updating } = useUpdateShowtime();
    const isLoading = creating || updating;

    const movieOptions = useMemo(
        () => (movieData?.items ?? []).map((m) => ({ value: m.movieId, label: m.title })),
        [movieData],
    );

    const roomOptions = useMemo(
        () => allRooms
            .filter((r) => r.cinemaId === cinemaId && r.status === "ACTIVE")
            .map((r) => ({ value: r.roomId, label: `${r.name} · ${r.type}` })),
        [allRooms, cinemaId],
    );

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
            create(payload, { onSuccess: onClose });
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
                    />
                </Form.Item>

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
