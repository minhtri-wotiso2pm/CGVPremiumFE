import { type FC, useEffect, useRef, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, Switch, Spin, Row, Col } from "antd";
import type { FnbProduct, FnbItemType, FnbItemStatus } from "../types/fnb-mgmt.types";
import { FNB_TYPE_OPTIONS, FNB_STATUS_OPTIONS } from "../types/fnb-mgmt.types";
import { useFnbProductDetail } from "../hooks/useFnbProductDetail";
import {
    useCreateFnbProduct,
    useUpdateFnbProduct,
    useUploadFnbProductImage,
} from "../hooks/useFnbProductMutations";

interface FormValues {
    itemName: string;
    itemType: string;
    description: string;
    price: number;
    stockQuantity: number;
    isOnMenu: boolean;
    isLoyaltyEligible: boolean;
    status?: string;
}

interface Props {
    mode: "create" | "edit";
    product: FnbProduct | null;
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
   FnbProductFormModal
══════════════════════════════════════════ */
const FnbProductFormModal: FC<Props> = ({ mode, product, open, onClose }) => {
    const [form] = Form.useForm<FormValues>();
    const isEdit = mode === "edit";

    /* ── Image state ── */
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── Fetch detail for edit ── */
    const { data: detail, isLoading: detailLoading } = useFnbProductDetail(
        isEdit ? (product?.itemID ?? null) : null,
    );

    const { mutate: create, isPending: creating } = useCreateFnbProduct();
    const { mutate: update, isPending: updating } = useUpdateFnbProduct();
    const { mutate: uploadImage, isPending: uploading } = useUploadFnbProductImage();

    const isSubmitting = creating || updating || uploading;
    const isFormLoading = isEdit && detailLoading;

    /* ── Populate form on open ── */
    useEffect(() => {
        if (!open) return;
        if (!isEdit) {
            form.resetFields();
            form.setFieldsValue({ isOnMenu: true, isLoyaltyEligible: false });
            setImageFile(null);
            setImagePreview(null);
            return;
        }
        if (detail) {
            form.setFieldsValue({
                itemName: detail.itemName,
                itemType: detail.itemType,
                description: detail.description ?? "",
                price: detail.price,
                stockQuantity: detail.stockQuantity,
                isOnMenu: detail.isOnMenu,
                isLoyaltyEligible: detail.isLoyaltyEligible,
                status: detail.status,
            });
            setImageFile(null);
            setImagePreview(detail.imageURL ?? null);
        }
    }, [open, isEdit, detail, form]);

    /* ── Cleanup blob URL on unmount / image change ── */
    useEffect(() => {
        return () => {
            if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    /* ── File picker handler ── */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
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

        const doUpload = (productId: number) => {
            if (imageFile) {
                uploadImage({ productId, file: imageFile }, { onSuccess: onClose, onError: onClose });
            } else {
                onClose();
            }
        };

        const basePayload = {
            itemName: values.itemName.trim(),
            itemType: values.itemType as FnbItemType,
            description: values.description?.trim() || null,
            price: values.price,
            stockQuantity: values.stockQuantity,
            imageURL: isEdit ? (detail?.imageURL ?? null) : null,
            isOnMenu: values.isOnMenu,
            isLoyaltyEligible: values.isLoyaltyEligible,
        };

        if (isEdit && product) {
            update(
                {
                    productId: product.itemID,
                    payload: { ...basePayload, status: (values.status ?? detail?.status ?? "in_stock") as FnbItemStatus },
                },
                { onSuccess: () => doUpload(product.itemID) },
            );
        } else {
            create(basePayload, {
                onSuccess: (result) => doUpload(result.itemID),
            });
        }
    };

    /* ── Render ── */
    return (
        <Modal
            title={isEdit ? "Sửa sản phẩm F&B" : "Thêm sản phẩm F&B"}
            open={open}
            onOk={handleSubmit}
            onCancel={!isSubmitting ? onClose : undefined}
            okText={isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
            cancelText="Hủy"
            confirmLoading={isSubmitting}
            maskClosable={!isSubmitting}
            width={620}
            destroyOnHidden
        >
            {isFormLoading ? (
                <div style={{ padding: "48px 0", textAlign: "center" }}>
                    <Spin tip="Đang tải thông tin sản phẩm..." />
                </div>
            ) : (
                <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 4 }}>
                    <SectionLabel>Thông tin cơ bản</SectionLabel>

                    <Form.Item
                        label="Tên sản phẩm"
                        name="itemName"
                        rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                    >
                        <Input placeholder="Vd: Combo Bắp Nước Lớn" maxLength={200} showCount />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Loại sản phẩm"
                                name="itemType"
                                rules={[{ required: true, message: "Chọn loại sản phẩm" }]}
                            >
                                <Select placeholder="Chọn loại" options={FNB_TYPE_OPTIONS} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Giá (VND)"
                                name="price"
                                rules={[{ required: true, message: "Nhập giá sản phẩm" }]}
                            >
                                <InputNumber<number>
                                    min={0}
                                    step={1000}
                                    placeholder="75000"
                                    formatter={(value) =>
                                        value != null
                                            ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                                            : ""
                                    }
                                    parser={(value) =>
                                        Number(value?.replace(/\./g, "") ?? 0)
                                    }
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={isEdit ? 12 : 24}>
                            <Form.Item
                                label="Tồn kho"
                                name="stockQuantity"
                                rules={[{ required: true, message: "Nhập số lượng tồn kho" }]}
                            >
                                <InputNumber min={0} placeholder="50" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        {isEdit && (
                            <Col span={12}>
                                <Form.Item label="Trạng thái" name="status">
                                    <Select placeholder="Trạng thái" options={FNB_STATUS_OPTIONS} />
                                </Form.Item>
                            </Col>
                        )}
                    </Row>

                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea
                            placeholder="Mô tả ngắn về sản phẩm..."
                            rows={2}
                            maxLength={500}
                            showCount
                            style={{ resize: "none" }}
                        />
                    </Form.Item>

                    <SectionLabel>Ảnh sản phẩm</SectionLabel>

                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        {/* Preview */}
                        <div style={{
                            width: 80, height: 80, flexShrink: 0,
                            borderRadius: 10, overflow: "hidden",
                            background: "var(--dash-border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid var(--dash-border)",
                            fontSize: 28,
                        }}>
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="preview"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : "🍿"}
                        </div>

                        <div style={{ flex: 1 }}>
                            <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--dash-text-2)" }}>
                                {imageFile
                                    ? `${imageFile.name} (${(imageFile.size / 1024).toFixed(0)} KB)`
                                    : imagePreview
                                        ? "Ảnh hiện tại. Nhấn bên dưới để thay đổi."
                                        : "Chọn ảnh từ máy (JPG, PNG, WebP)."}
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
                                📂 {imagePreview ? "Đổi ảnh" : "Chọn ảnh"}
                            </button>
                            {imageFile && (
                                <button
                                    type="button"
                                    className="dash-icon-btn"
                                    onClick={() => {
                                        if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
                                        setImageFile(null);
                                        setImagePreview(isEdit ? (detail?.imageURL ?? null) : null);
                                    }}
                                    style={{
                                        marginLeft: 8,
                                        padding: "6px 10px",
                                        fontSize: 12,
                                        border: "1px solid rgba(232,0,28,0.25)",
                                        borderRadius: 6,
                                        width: "auto",
                                        height: "auto",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        color: "#E8001C",
                                    }}
                                >
                                    ✕ Bỏ chọn
                                </button>
                            )}
                        </div>
                    </div>

                    <SectionLabel>Hiển thị</SectionLabel>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                label="Hiển thị trên menu"
                                name="isOnMenu"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Tích điểm thành viên"
                                name="isLoyaltyEligible"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Có" unCheckedChildren="Không" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            )}
        </Modal>
    );
};

export default FnbProductFormModal;
