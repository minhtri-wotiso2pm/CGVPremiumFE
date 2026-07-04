import { type FC, useEffect, useRef, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, Switch, DatePicker, Row, Col } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { Voucher, VoucherFormData } from "../types/voucher.types";
import {
    DISCOUNT_TYPE_OPTIONS,
    VOUCHER_CATEGORY_OPTIONS,
    DEFAULT_VOUCHER_CATEGORY,
} from "../constants/voucher.constants";
import {
    voucherCodeRules,
    categoryRules,
    discountTypeRules,
    validityRules,
    descriptionRules,
} from "../schemas/voucher.schema";
import { useCreateVoucher, useUpdateVoucher } from "../hooks/useVouchers";

const { RangePicker } = DatePicker;

interface Props {
    mode: "create" | "edit";
    voucher?: Voucher | null;
    open: boolean;
    onClose: () => void;
}

interface FormValues {
    voucherCode: string;
    category: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    maxUses: number;
    validity: [Dayjs, Dayjs];
    description: string;
    isActive: boolean;
}

const toVnStart = (d: Dayjs) => `${d.format("YYYY-MM-DD")}T00:00:00+07:00`;
const toVnEnd = (d: Dayjs) => `${d.format("YYYY-MM-DD")}T23:59:59+07:00`;

const VoucherModal: FC<Props> = ({ mode, voucher, open, onClose }) => {
    const [form] = Form.useForm<FormValues>();
    const isEdit = mode === "edit";

    const { mutate: create, isPending: creating } = useCreateVoucher();
    const { mutate: update, isPending: updating } = useUpdateVoucher();
    const isLoading = creating || updating;

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const discountType = Form.useWatch("discountType", form);

    // Reset image state when the modal opens or the target voucher changes —
    // adjust-during-render (not an effect) so we don't cascade renders.
    const openKey = open ? `${voucher?.voucherId ?? "new"}` : "closed";
    const [syncedKey, setSyncedKey] = useState("closed");
    if (openKey !== syncedKey) {
        setSyncedKey(openKey);
        setImageFile(null);
        setImagePreview(open && isEdit ? (voucher?.imageUrl ?? null) : null);
    }

    // Form values live in the AntD form store (not React state) — safe in an effect.
    useEffect(() => {
        if (open) {
            if (isEdit && voucher) {
                form.setFieldsValue({
                    voucherCode: voucher.voucherCode,
                    category: voucher.category,
                    discountType: voucher.discountType,
                    discountValue: voucher.discountValue,
                    minOrderValue: voucher.minOrderValue,
                    maxUses: voucher.maxUses,
                    validity: [dayjs(voucher.validFrom.slice(0, 10)), dayjs(voucher.validUntil.slice(0, 10))],
                    description: voucher.description,
                    isActive: voucher.isActive,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    category: DEFAULT_VOUCHER_CATEGORY,
                    discountType: "percent",
                    discountValue: 10,
                    minOrderValue: 0,
                    maxUses: 100,
                    isActive: true,
                });
            }
        }
    }, [open, isEdit, voucher, form]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        const values = await form.validateFields();
        const data: VoucherFormData = {
            voucherCode: values.voucherCode.trim(),
            category: values.category ?? DEFAULT_VOUCHER_CATEGORY,
            discountType: values.discountType,
            discountValue: values.discountValue,
            minOrderValue: values.minOrderValue ?? 0,
            maxUses: values.maxUses ?? 0,
            validFrom: toVnStart(values.validity[0]),
            validUntil: toVnEnd(values.validity[1]),
            description: values.description ?? "",
            isActive: values.isActive,
            image: imageFile,
        };
        if (isEdit && voucher) {
            update({ voucherId: voucher.voucherId, data }, { onSuccess: onClose });
        } else {
            create(data, { onSuccess: onClose });
        }
    };

    const isPercent = discountType === "percent";

    return (
        <Modal
            title={isEdit ? "Edit Promotion" : "Add New Promotion"}
            open={open}
            onOk={handleSubmit}
            onCancel={() => { if (!isLoading) onClose(); }}
            okText={isEdit ? "Save Changes" : "Create Promotion"}
            cancelText="Cancel"
            confirmLoading={isLoading}
            maskClosable={!isLoading}
            width={560}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 4 }}>
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item label="Voucher Code" name="voucherCode" rules={voucherCodeRules}>
                            <Input placeholder="e.g. SUMMER10" maxLength={40} style={{ textTransform: "uppercase" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Category" name="category" rules={categoryRules}>
                            <Select options={[...VOUCHER_CATEGORY_OPTIONS]} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item label="Discount Type" name="discountType" rules={discountTypeRules}>
                            <Select options={[...DISCOUNT_TYPE_OPTIONS]} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={isPercent ? "Discount (%)" : "Discount (₫)"}
                            name="discountValue"
                            rules={[
                                { required: true, message: "Discount value is required" },
                                { type: "number", min: isPercent ? 1 : 1000, max: isPercent ? 100 : undefined, message: isPercent ? "1–100%" : "At least 1,000₫" },
                            ]}
                        >
                            <InputNumber
                                min={0}
                                max={isPercent ? 100 : undefined}
                                step={isPercent ? 1 : 1000}
                                style={{ width: "100%" }}
                                addonAfter={isPercent ? "%" : "₫"}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item label="Min Order Value (₫)" name="minOrderValue">
                            <InputNumber
                                min={0}
                                step={1000}
                                style={{ width: "100%" }}
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(v) => Number((v ?? "").replace(/,/g, "")) as 0}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Max Uses" name="maxUses" rules={[{ type: "number", min: 1, message: "At least 1" }]}>
                            <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Validity Period" name="validity" rules={validityRules}>
                    <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Description" name="description" rules={descriptionRules}>
                    <Input.TextArea placeholder="Short description shown to customers" maxLength={250} showCount rows={2} style={{ resize: "none" }} />
                </Form.Item>

                {/* Image */}
                <Form.Item label="Banner Image">
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            onClick={() => fileRef.current?.click()}
                            style={{
                                width: 120, height: 68, borderRadius: 8, cursor: "pointer",
                                border: "1px dashed var(--dash-border)", overflow: "hidden",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "var(--dash-bg)", flexShrink: 0,
                            }}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <span style={{ fontSize: 12, color: "var(--dash-text-3)" }}>Upload</span>
                            )}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--dash-text-2)" }}>
                            Optional. Click the box to {imagePreview ? "replace" : "select"} an image.
                        </div>
                    </div>
                </Form.Item>

                <Form.Item label="Active" name="isActive" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default VoucherModal;
