import { type FC, useEffect, useRef, useState } from "react";
import {
    Modal, Form, Input, Select, InputNumber, DatePicker, Row, Col, Spin,
} from "antd";
import dayjs from "dayjs";
import type { MovieListItem } from "../types/movie-mgmt.types";
import { AGE_RATING_OPTIONS, MOVIE_STATUS_OPTIONS } from "../types/movie-mgmt.types";
import { useManagerMovieDetail } from "../hooks/useMovieDetail";
import { useCreateMovie, useUpdateMovie, useUploadMoviePoster } from "../hooks/useMovieMutations";
import { useGenreList } from "../hooks/useGenreList";

interface FormValues {
    title: string;
    director: string;
    cast?: string;
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
    const [posterFile, setPosterFile]       = useState<File | null>(null);
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
                title:           detail.title,
                director:        detail.director,
                cast:            detail.cast,
                synopsis:        detail.synopsis,
                durationMinutes: detail.durationMinutes,
                ageRating:       detail.ageRating,
                showingFromDate: detail.showingFromDate ? dayjs(detail.showingFromDate) : undefined,
                showingToDate:   detail.showingToDate   ? dayjs(detail.showingToDate)   : undefined,
                trailerUrl:      detail.trailerUrl ?? "",
                genres:          detail.genres ?? [],
                status:          detail.status,
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
            title:           values.title.trim(),
            genres:          values.genres ?? [],
            ageRating:       values.ageRating,
            director:        values.director.trim(),
            cast:            values.cast?.trim() ?? "",
            synopsis:        values.synopsis?.trim() ?? "",
            durationMinutes: values.durationMinutes,
            showingFromDate: values.showingFromDate.format("YYYY-MM-DD"),
            showingToDate:   values.showingToDate.format("YYYY-MM-DD"),
            posterUrl:       detail?.posterUrl ?? null,
            posterPublicId:  detail?.posterPublicId ?? null,
            trailerUrl:      values.trailerUrl?.trim() || null,
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
            title={isEdit ? "Sửa thông tin phim" : "Thêm phim mới"}
            open={open}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText={isEdit ? "Lưu thay đổi" : "Tạo phim"}
            cancelText="Hủy"
            confirmLoading={isLoading}
            maskClosable={!isLoading}
            width={680}
            destroyOnHidden
        >
            {isFormLoading ? (
                <div style={{ padding: "48px 0", textAlign: "center" }}>
                    <Spin tip="Đang tải thông tin phim..." />
                </div>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    style={{ marginTop: 4 }}
                >
                    <SectionLabel>Thông tin cơ bản</SectionLabel>

                    <Form.Item
                        label="Tên phim"
                        name="title"
                        rules={[{ required: true, message: "Vui lòng nhập tên phim" }]}
                    >
                        <Input placeholder="Tên phim" maxLength={200} showCount />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Đạo diễn"
                                name="director"
                                rules={[{ required: true, message: "Vui lòng nhập tên đạo diễn" }]}
                            >
                                <Input placeholder="Tên đạo diễn" maxLength={100} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Diễn viên chính" name="cast">
                                <Input placeholder="Diễn viên chính (ngăn cách bởi dấu phẩy)" maxLength={200} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Thời lượng (phút)"
                                name="durationMinutes"
                                rules={[{ required: true, message: "Vui lòng nhập thời lượng" }]}
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
                                label="Xếp hạng tuổi"
                                name="ageRating"
                                rules={[{ required: true, message: "Chọn xếp hạng" }]}
                            >
                                <Select placeholder="Chọn xếp hạng" options={AGE_RATING_OPTIONS} />
                            </Form.Item>
                        </Col>
                        {isEdit && (
                            <Col span={8}>
                                <Form.Item label="Trạng thái" name="status">
                                    <Select placeholder="Trạng thái" options={MOVIE_STATUS_OPTIONS} />
                                </Form.Item>
                            </Col>
                        )}
                    </Row>

                    <SectionLabel>Nội dung</SectionLabel>

                    <Form.Item label="Tóm tắt nội dung" name="synopsis">
                        <Input.TextArea
                            placeholder="Mô tả nội dung phim..."
                            rows={3}
                            maxLength={1000}
                            showCount
                            style={{ resize: "none" }}
                        />
                    </Form.Item>

                    <Form.Item label="Trailer URL" name="trailerUrl">
                        <Input placeholder="https://youtube.com/watch?v=..." />
                    </Form.Item>

                    <SectionLabel>Lịch chiếu</SectionLabel>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Ngày bắt đầu chiếu"
                                name="showingFromDate"
                                rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Ngày kết thúc chiếu"
                                name="showingToDate"
                                rules={[{ required: true, message: "Chọn ngày kết thúc" }]}
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <SectionLabel>Thể loại</SectionLabel>

                    <Form.Item name="genres">
                        <Select
                            mode="multiple"
                            placeholder={genresLoading ? "Đang tải thể loại..." : "Chọn thể loại phim"}
                            options={genreOptions}
                            loading={genresLoading}
                            allowClear
                            style={{ width: "100%" }}
                        />
                    </Form.Item>

                    <SectionLabel>Poster phim</SectionLabel>

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
                                {posterPreview ? "Poster đã được chọn. Nhấn bên dưới để thay đổi." : "Chọn ảnh poster (JPG, PNG — tỷ lệ 2:3 khuyến nghị)."}
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
                                📂 {posterPreview ? "Đổi poster" : "Chọn ảnh"}
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
