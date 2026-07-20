import { type FC, useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, Row, Col, Spin, Button } from "antd";
import dayjs from "dayjs";
import ImageCropModal from "@/components/ui/ImageCropModal";
import { PersonPhotoIcon } from "@/components/ui/BrandIcons";
import { usePersonDetail } from "../hooks/usePersonDetail";
import { useCreatePerson, useUpdatePerson, useUploadPersonPhoto } from "../hooks/usePersonMutations";
import { GENDER_OPTIONS } from "../constants/person.constants";
import type { CreatePersonPayload, PersonDetail } from "../types/person.types";

interface FormValues {
    name: string;
    nationality?: string;
    gender?: string;
    dateOfBirth?: dayjs.Dayjs;
    biography?: string;
}

interface Props {
    mode: "create" | "edit";
    personId: number | null;
    open: boolean;
    onClose: () => void;
    /** Fired after a successful create — used by <PersonSelect> for quick-add. */
    onCreated?: (person: PersonDetail) => void;
    /** Raise the modal above a parent modal (nested quick-create). */
    zIndex?: number;
}

/* ── Section divider (matches MovieFormModal) ── */
const SectionLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
    <p style={{
        margin: "16px 0 8px",
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--dash-text-3)",
        borderBottom: "1px solid var(--dash-border)", paddingBottom: 6,
    }}>
        {children}
    </p>
);

const PersonFormModal: FC<Props> = ({ mode, personId, open, onClose, onCreated, zIndex }) => {
    const [form] = Form.useForm<FormValues>();
    const isEdit = mode === "edit";

    /* ── Photo state ── */
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [existingPhoto, setExistingPhoto] = useState<{ url: string | null; publicId: string | null }>({ url: null, publicId: null });
    const [cropOpen, setCropOpen] = useState(false);

    /* ── Data hooks ── */
    const { data: detail, isLoading: detailLoading } = usePersonDetail(isEdit && open ? personId : null);
    const { mutateAsync: create, isPending: creating } = useCreatePerson();
    const { mutateAsync: update, isPending: updating } = useUpdatePerson();
    const { mutateAsync: uploadPhoto, isPending: uploading } = useUploadPersonPhoto();

    const isLoading = creating || updating || uploading;
    const isFormLoading = isEdit && detailLoading;

    /* ── Populate on open ── */
    useEffect(() => {
        if (!open) return;
        if (!isEdit) {
            form.resetFields();
            setPhotoFile(null);
            setPhotoPreview(null);
            setExistingPhoto({ url: null, publicId: null });
            return;
        }
        if (detail) {
            form.setFieldsValue({
                name: detail.name,
                nationality: detail.nationality ?? undefined,
                gender: detail.gender ?? undefined,
                dateOfBirth: detail.dateOfBirth ? dayjs(detail.dateOfBirth) : undefined,
                biography: detail.biography ?? undefined,
            });
            setPhotoPreview(detail.photoUrl ?? null);
            setPhotoFile(null);
            setExistingPhoto({ url: detail.photoUrl ?? null, publicId: detail.photoPublicId ?? null });
        }
    }, [open, isEdit, detail, form]);

    /* ── Cleanup blob URLs ── */
    useEffect(() => {
        return () => {
            if (photoPreview && photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
        };
    }, [photoPreview]);

    const handleCropDone = (file: File) => {
        setPhotoFile(file);
        if (photoPreview && photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(URL.createObjectURL(file));
        setCropOpen(false);
    };

    const handleSubmit = async () => {
        let values: FormValues;
        try {
            values = await form.validateFields();
        } catch {
            return;
        }

        // Upload the freshly cropped photo first (if any) to get url + publicId.
        let photoUrl = existingPhoto.url;
        let photoPublicId = existingPhoto.publicId;
        if (photoFile) {
            try {
                const uploaded = await uploadPhoto(photoFile);
                photoUrl = uploaded.url;
                photoPublicId = uploaded.publicId;
            } catch {
                return; // upload mutation surfaces its own state; abort save
            }
        }

        const payload: CreatePersonPayload = {
            name: values.name.trim(),
            nationality: values.nationality?.trim() || null,
            gender: values.gender || null,
            dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
            biography: values.biography?.trim() || null,
            photoUrl: photoUrl || null,
            photoPublicId: photoPublicId || null,
        };

        try {
            if (isEdit && personId) {
                await update({ id: personId, payload });
            } else {
                const created = await create(payload);
                onCreated?.(created);
            }
            onClose();
        } catch {
            /* mutation onError handles the toast */
        }
    };

    const handleCancel = () => {
        if (!isLoading) onClose();
    };

    return (
        <>
            <Modal
                title={isEdit ? "Edit Person" : "Add New Person"}
                open={open}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okText={isEdit ? "Save Changes" : "Create Person"}
                cancelText="Cancel"
                confirmLoading={isLoading}
                maskClosable={!isLoading}
                width={620}
                destroyOnHidden
                zIndex={zIndex}
            >
                {isFormLoading ? (
                    <div style={{ padding: "48px 0", textAlign: "center" }}>
                        <Spin tip="Loading details..." />
                    </div>
                ) : (
                    <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 4 }}>
                        <SectionLabel>Profile</SectionLabel>

                        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                            {/* Photo */}
                            <div style={{ flexShrink: 0, textAlign: "center" }}>
                                <div style={{
                                    width: 96, height: 96, borderRadius: "50%", overflow: "hidden",
                                    background: "var(--dash-border)", border: "1px solid var(--dash-border)",
                                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px",
                                }}>
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Person" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ color: "var(--dash-text-3)" }}><PersonPhotoIcon size={40} /></span>
                                    )}
                                </div>
                                <Button size="small" onClick={() => setCropOpen(true)}>
                                    {photoPreview ? "Change" : "Add Photo"}
                                </Button>
                            </div>

                            {/* Name + nationality */}
                            <div style={{ flex: 1 }}>
                                <Form.Item
                                    label="Full Name"
                                    name="name"
                                    rules={[
                                        { required: true, message: "Please enter the person's name" },
                                        { whitespace: true, message: "Name cannot be blank" },
                                    ]}
                                >
                                    <Input placeholder="e.g. Christopher Nolan" maxLength={200} showCount />
                                </Form.Item>

                                <Row gutter={12}>
                                    <Col span={12}>
                                        <Form.Item label="Nationality" name="nationality">
                                            <Input placeholder="e.g. United Kingdom" maxLength={100} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Gender" name="gender">
                                            <Select placeholder="Select" options={GENDER_OPTIONS} allowClear />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <Form.Item label="Date of Birth" name="dateOfBirth">
                            <DatePicker
                                format="DD/MM/YYYY"
                                placeholder="Select date"
                                style={{ width: "100%" }}
                                disabledDate={(d) => d && d.isAfter(dayjs(), "day")}
                            />
                        </Form.Item>

                        <SectionLabel>Biography</SectionLabel>

                        <Form.Item name="biography">
                            <Input.TextArea
                                placeholder="Short biography (optional)…"
                                rows={4}
                                maxLength={4000}
                                showCount
                                style={{ resize: "none" }}
                            />
                        </Form.Item>
                    </Form>
                )}
            </Modal>

            <ImageCropModal
                open={cropOpen}
                aspect={1}
                cropShape="round"
                title="Adjust Photo"
                onCancel={() => setCropOpen(false)}
                onDone={handleCropDone}
                zIndex={(zIndex ?? 1000) + 60}
            />
        </>
    );
};

export default PersonFormModal;
