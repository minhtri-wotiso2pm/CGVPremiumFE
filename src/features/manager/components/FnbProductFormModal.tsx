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
import { FnbBagIcon, UploadImageIcon } from "@/components/ui/BrandIcons";

interface FormValues {
    itemName: string;
    itemType: string;
    description: string;
    price: number;
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
            form.setFieldsValue({ isLoyaltyEligible: false });
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
            imageURL: isEdit ? (detail?.imageURL ?? null) : null,
            isLoyaltyEligible: values.isLoyaltyEligible,
        };

        if (isEdit && product) {
            update(
                {
                    productId: product.itemID,
                    payload: { ...basePayload, status: (values.status ?? detail?.status ?? "active") as FnbItemStatus },
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
            title={isEdit ? "Edit F&B Product" : "Add F&B Product"}
            open={open}
            onOk={handleSubmit}
            onCancel={!isSubmitting ? onClose : undefined}
            okText={isEdit ? "Save Changes" : "Add Product"}
            cancelText="Cancel"
            confirmLoading={isSubmitting}
            maskClosable={!isSubmitting}
            width={620}
            destroyOnHidden
        >
            {isFormLoading ? (
                <div style={{ padding: "48px 0", textAlign: "center" }}>
                    <Spin tip="Loading product details..." />
                </div>
            ) : (
                <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 4 }}>
                    <SectionLabel>Basic Information</SectionLabel>

                    <Form.Item
                        label="Product Name"
                        name="itemName"
                        rules={[{ required: true, message: "Please enter the product name" }]}
                    >
                        <Input placeholder="e.g. Large Popcorn Combo" maxLength={200} showCount />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Product Type"
                                name="itemType"
                                rules={[{ required: true, message: "Select a product type" }]}
                            >
                                <Select placeholder="Select type" options={FNB_TYPE_OPTIONS} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Price (VND)"
                                name="price"
                                rules={[{ required: true, message: "Enter the product price" }]}
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

                    {isEdit && (
                        <Form.Item label="Status" name="status">
                            <Select placeholder="Status" options={FNB_STATUS_OPTIONS} />
                        </Form.Item>
                    )}

                    <Form.Item label="Description" name="description">
                        <Input.TextArea
                            placeholder="Short description of the product..."
                            rows={2}
                            maxLength={500}
                            showCount
                            style={{ resize: "none" }}
                        />
                    </Form.Item>

                    <SectionLabel>Product Image</SectionLabel>

                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        {/* Preview */}
                        <div style={{
                            width: 80, height: 80, flexShrink: 0,
                            borderRadius: 10, overflow: "hidden",
                            background: "var(--dash-border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid var(--dash-border)",
                            color: "var(--dash-text-3)",
                        }}>
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="preview"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : <FnbBagIcon size={30} />}
                        </div>

                        <div style={{ flex: 1 }}>
                            <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--dash-text-2)" }}>
                                {imageFile
                                    ? `${imageFile.name} (${(imageFile.size / 1024).toFixed(0)} KB)`
                                    : imagePreview
                                        ? "Current image. Click below to change it."
                                        : "Select an image from your device (JPG, PNG, WebP)."}
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
                                <UploadImageIcon size={15} /> {imagePreview ? "Change Image" : "Select Image"}
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
                                    ✕ Remove
                                </button>
                            )}
                        </div>
                    </div>

                    <SectionLabel>Loyalty</SectionLabel>

                    <Form.Item
                        label="Loyalty Points Eligible"
                        name="isLoyaltyEligible"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default FnbProductFormModal;
