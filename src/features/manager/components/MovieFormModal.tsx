import { type FC, useEffect, useRef, useState } from "react";
import {
    Modal, Form, Input, Select, InputNumber, DatePicker, Row, Col, Spin,
} from "antd";
import dayjs from "dayjs";
import { AGE_RATING_OPTIONS, MOVIE_STATUS_OPTIONS } from "../types/movie-mgmt.types";
import { useManagerMovieDetail } from "../hooks/useMovieDetail";
import { useCreateMovie, useUpdateMovie, useUploadMoviePoster } from "../hooks/useMovieMutations";
import { useGenreList } from "../hooks/useGenreList";
import PersonSelect from "@/features/persons/components/PersonSelect";

interface FormValues {
    title: string;
    directorIds: number[];
    actorIds: number[];
    synopsis?: string;
    durationMinutes: number;
    ageRating: string;
    showingFromDate: dayjs.Dayjs;
    showingToDate: dayjs.Dayjs;
    trailerUrl?: string;
    genres: string[];
    status?: string;
}

interface Props {
    mode: "create" | "edit";
    movieId: number | null;
    open: boolean;
    onClose: () => void;
}

/* ── Section divider ── */
const SectionLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
    <p style={{
        margin: "16px 0 8px",
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--dash-text-3)",
        borderBottom: "1px solid var(--dash-border)",
        paddingBottom: 6,
    }}>
        {children}
    </p>
);

/* ══════════════════════════════════════════
   MovieFormModal
══════════════════════════════════════════ */
const MovieFormModal: FC<Props> = ({ mode, movieId, open, onClose }) => {
    const [form] = Form.useForm<FormValues>();
    const isEdit = mode === "edit";

    /* ── Poster state ── */
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── Data hooks ── */
    const { data: genres = [], isLoading: genresLoading } = useGenreList();
    const {
        data: detail,
        isLoading: detailLoading,
    } = useManagerMovieDetail(isEdit ? movieId : null);

    const { mutate: create, isPending: creating } = useCreateMovie();
    const { mutate: update, isPending: updating } = useUpdateMovie();
    const { mutate: uploadPoster, isPending: uploading } = useUploadMoviePoster();

    const isLoading = creating || updating || uploading;
    const isFormLoading = isEdit && detailLoading;

    /* ── Populate form on open ── */
    useEffect(() => {
        if (!open) return;
        if (!isEdit) {
            form.resetFields();
            setPosterFile(null);
            setPosterPreview(null);
            return;
        }
        if (detail) {
            form.setFieldsValue({
                title: detail.title,
                directorIds: detail.directors?.map((d) => d.id) ?? [],
                actorIds: detail.actors?.map((a) => a.id) ?? [],
                synopsis: detail.synopsis,
                durationMinutes: detail.durationMinutes,
                ageRating: detail.ageRating,
                showingFromDate: detail.showingFromDate ? dayjs(detail.showingFromDate) : undefined,
                showingToDate: detail.showingToDate ? dayjs(detail.showingToDate) : undefined,
                trailerUrl: detail.trailerUrl ?? "",
                genres: detail.genres ?? [],
                status: detail.status,
            });
            setPosterPreview(detail.posterUrl ?? null);
            setPosterFile(null);
        }
    }, [open, isEdit, detail, form]);

    /* ── Cleanup object URL ── */
    useEffect(() => {
        return () => {
            if (posterPreview && posterPreview.startsWith("blob:")) {
                URL.revokeObjectURL(posterPreview);
            }
        };
    }, [posterPreview]);

    /* ── Poster file select ── */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPosterFile(file);
        setPosterPreview(URL.createObjectURL(file));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        let values: FormValues;
        try {
            values = await form.validateFields();
        } catch {
            return;
        }

        const basePayload = {
            title: values.title.trim(),
            genres: values.genres ?? [],
            ageRating: values.ageRating,
            directorIds: values.directorIds ?? [],
            actorIds: values.actorIds ?? [],
            synopsis: values.synopsis?.trim() ?? "",
            durationMinutes: values.durationMinutes,
            showingFromDate: values.showingFromDate.format("YYYY-MM-DD"),
            showingToDate: values.showingToDate.format("YYYY-MM-DD"),
            posterUrl: detail?.posterUrl ?? null,
            posterPublicId: detail?.posterPublicId ?? null,
            trailerUrl: values.trailerUrl?.trim() || null,
        };

        if (isEdit && movieId) {
            const updatePayload = { ...basePayload, status: values.status ?? detail?.status ?? "now_showing" };
            update(
                { movieId, payload: updatePayload },
                {
                    onSuccess: () => {
                        if (posterFile) {
                            uploadPoster({ movieId, file: posterFile }, { onSuccess: onClose, onError: onClose });
                        } else {
                            onClose();
                        }
                    },
                },
            );
        } else {
            create(basePayload, {
                onSuccess: (result) => {
                    if (posterFile && result.movieId) {
                        uploadPoster(
                            { movieId: result.movieId, file: posterFile },
                            { onSuccess: onClose, onError: onClose },
                        );
                    } else {
                        onClose();
                    }
                },
            });
        }
    };

    const handleCancel = () => {
        if (!isLoading) onClose();
    };

    /* ── Genre options ── */
    const genreOptions = genres.map((g) => ({ value: g.genreName, label: g.genreName }));

    /* ── Render ── */
    return (
        <Modal
            title={isEdit ? "Edit Movie" : "Add New Movie"}
            open={open}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText={isEdit ? "Save Changes" : "Create Movie"}
            cancelText="Cancel"
            confirmLoading={isLoading}
            maskClosable={!isLoading}
            width={680}
            destroyOnHidden
        >
            {isFormLoading ? (
                <div style={{ padding: "48px 0", textAlign: "center" }}>
                    <Spin tip="Loading movie details..." />
                </div>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    style={{ marginTop: 4 }}
                >
                    <SectionLabel>Basic Information</SectionLabel>

                    <Form.Item
                        label="Movie Title"
                        name="title"
                        rules={[{ required: true, message: "Please enter the movie title" }]}
                    >
                        <Input placeholder="Movie title" maxLength={200} showCount />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Duration (minutes)"
                                name="durationMinutes"
                                rules={[{ required: true, message: "Please enter the duration" }]}
                            >
                                <InputNumber
                                    min={1} max={600}
                                    placeholder="120"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Age Rating"
                                name="ageRating"
                                rules={[{ required: true, message: "Select an age rating" }]}
                            >
                                <Select placeholder="Select rating" options={AGE_RATING_OPTIONS} />
                            </Form.Item>
                        </Col>
                        {isEdit && (
                            <Col span={8}>
                                <Form.Item label="Status" name="status">
                                    <Select placeholder="Status" options={MOVIE_STATUS_OPTIONS} />
                                </Form.Item>
                            </Col>
                        )}
                    </Row>

                    <SectionLabel>Cast &amp; Crew</SectionLabel>

                    <Form.Item
                        label="Directors"
                        name="directorIds"
                        rules={[{ required: true, type: "array", min: 1, message: "Select at least one director" }]}
                    >
                        <PersonSelect
                            seed={detail?.directors}
                            placeholder="Search directors…"
                        />
                    </Form.Item>

                    <Form.Item label="Actors / Cast" name="actorIds">
                        <PersonSelect
                            seed={detail?.actors}
                            placeholder="Search actors…"
                        />
                    </Form.Item>

                    <SectionLabel>Content</SectionLabel>

                    <Form.Item label="Synopsis" name="synopsis">
                        <Input.TextArea
                            placeholder="Describe the movie's plot..."
                            rows={3}
                            maxLength={1000}
                            showCount
                            style={{ resize: "none" }}
                        />
                    </Form.Item>

                    <Form.Item label="Trailer URL" name="trailerUrl">
                        <Input placeholder="https://youtube.com/watch?v=..." />
                    </Form.Item>

                    <SectionLabel>Screening Schedule</SectionLabel>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Showing From"
                                name="showingFromDate"
                                rules={[{ required: true, message: "Select a start date" }]}
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="Select date"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Showing To"
                                name="showingToDate"
                                rules={[{ required: true, message: "Select an end date" }]}
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="Select date"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <SectionLabel>Genres</SectionLabel>

                    <Form.Item name="genres">
                        <Select
                            mode="multiple"
                            placeholder={genresLoading ? "Loading genres..." : "Select movie genres"}
                            options={genreOptions}
                            loading={genresLoading}
                            allowClear
                            style={{ width: "100%" }}
                        />
                    </Form.Item>

                    <SectionLabel>Movie Poster</SectionLabel>

                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        {/* Preview */}
                        <div style={{
                            width: 80, height: 112, flexShrink: 0,
                            borderRadius: 6, overflow: "hidden",
                            background: "var(--dash-border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid var(--dash-border)",
                        }}>
                            {posterPreview ? (
                                <img
                                    src={posterPreview}
                                    alt="Poster preview"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                <span style={{ fontSize: 28 }}>🎬</span>
                            )}
                        </div>

                        <div style={{ flex: 1 }}>
                            <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--dash-text-2)" }}>
                                {posterPreview ? "Poster selected. Click below to change it." : "Select a poster image (JPG, PNG — 2:3 ratio recommended)."}
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                style={{ display: "none" }}
                                onChange={handleFileSelect}
                            />
                            <button
                                type="button"
                                className="dash-icon-btn"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    padding: "6px 14px",
                                    fontSize: 13,
                                    border: "1px solid var(--dash-border)",
                                    borderRadius: 6,
                                    width: "auto",
                                    height: "auto",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                📂 {posterPreview ? "Change Poster" : "Select Image"}
                            </button>
                            {posterFile && (
                                <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--dash-text-3)" }}>
                                    {posterFile.name} ({(posterFile.size / 1024).toFixed(0)} KB)
                                </p>
                            )}
                        </div>
                    </div>
                </Form>
            )}
        </Modal>
    );
};

export default MovieFormModal;
