import { type FC, useEffect, useRef, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, Switch, DatePicker, Row, Col, Spin, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import type { Voucher, VoucherFormData, VoucherRule } from "../types/voucher.types";
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
import { useCreateVoucher, useUpdateVoucher, useVoucherRuleTypes, useUploadVoucherImage } from "../hooks/useVouchers";
import VoucherRulesEditor from "./VoucherRulesEditor";

const { RangePicker } = DatePicker;

const MAX_IMAGE_MB = 5;

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
    isRedeemable: boolean;
    requiredPoints?: number;
    exchangeLimit?: number;
}

const toVnStart = (d: Dayjs) => `${d.format("YYYY-MM-DD")}T00:00:00+07:00`;
const toVnEnd = (d: Dayjs) => `${d.format("YYYY-MM-DD")}T23:59:59+07:00`;

const VoucherModal: FC<Props> = ({ mode, voucher, open, onClose }) => {
    const [form] = Form.useForm<FormValues>();
    const isEdit = mode === "edit";

    const { mutate: create, isPending: creating } = useCreateVoucher();
    const { mutate: update, isPending: updating } = useUpdateVoucher();
    const isLoading = creating || updating;

    const { data: ruleMetadata = [], isLoading: ruleMetadataLoading } = useVoucherRuleTypes();
    const uploadImage = useUploadVoucherImage();

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imagePublicId, setImagePublicId] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [rules, setRules] = useState<VoucherRule[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const discountType = Form.useWatch("discountType", form);
    const isRedeemable = Form.useWatch("isRedeemable", form);

    // Reset image/rules state when the modal opens or the target voucher changes —
    // adjust-during-render (not an effect) so we don't cascade renders.
    const openKey = open ? `${voucher?.voucherId ?? "new"}` : "closed";
    const [syncedKey, setSyncedKey] = useState("closed");
    if (openKey !== syncedKey) {
        setSyncedKey(openKey);
        setPendingFile(null);
        setImageError(null);
        setImagePreview(open && isEdit ? (voucher?.imageUrl ?? null) : null);
        setImageUrl(open && isEdit ? (voucher?.imageUrl ?? null) : null);
        setImagePublicId(open && isEdit ? (voucher?.imagePublicId ?? null) : null);
        setRules(open && isEdit ? (voucher?.rules ?? []) : []);
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
                    isRedeemable: voucher.isRedeemable,
                    requiredPoints: voucher.requiredPoints ?? undefined,
                    exchangeLimit: voucher.exchangeLimit ?? undefined,
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
                    isRedeemable: false,
                });
            }
        }
    }, [open, isEdit, voucher, form]);

    const startUpload = (file: File) => {
        setPendingFile(file);
        setImageError(null);
        setImagePreview(URL.createObjectURL(file));
        uploadImage.mutate(file, {
            onSuccess: (result) => {
                setImageUrl(result.imageUrl);
                setImagePublicId(result.imagePublicId);
            },
            onError: () => setImageError("Upload failed."),
        });
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-selecting the same file after a remove/retry
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setImageError("Please select an image file.");
            return;
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            setImageError(`Image must be smaller than ${MAX_IMAGE_MB}MB.`);
            return;
        }
        startUpload(file);
    };

    const retryUpload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (pendingFile) startUpload(pendingFile);
    };

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImagePreview(null);
        setImageUrl(null);
        setImagePublicId(null);
        setImageError(null);
        setPendingFile(null);
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
            imageUrl,
            imagePublicId,
            rules,
            isRedeemable: values.isRedeemable ?? false,
            requiredPoints: values.isRedeemable ? values.requiredPoints : null,
            exchangeLimit: values.isRedeemable ? values.exchangeLimit : null,
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
            okButtonProps={{ disabled: uploadImage.isPending }}
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

                <Form.Item
                    label="Loyalty Voucher"
                    name="isRedeemable"
                    valuePropName="checked"
                    tooltip="On: customers must redeem this with points before they can use it. Off: available to everyone directly."
                >
                    <Switch />
                </Form.Item>

                {isRedeemable && (
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item
                                label="Required Points"
                                name="requiredPoints"
                                rules={[
                                    { required: true, message: "Required" },
                                    { type: "number", min: 1, message: "At least 1" },
                                ]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Exchange Limit (per user)"
                                name="exchangeLimit"
                                rules={[
                                    { required: true, message: "Required" },
                                    { type: "number", min: 1, message: "At least 1" },
                                ]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                <Form.Item label="Validity Period" name="validity" rules={validityRules}>
                    <RangePicker
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                        disabledDate={(current) => !!current && current < dayjs().startOf("day")}
                    />
                </Form.Item>

                <Form.Item label="Description" name="description" rules={descriptionRules}>
                    <Input.TextArea placeholder="Short description shown to customers" maxLength={250} showCount rows={2} style={{ resize: "none" }} />
                </Form.Item>

                {/* Rules — fully driven by GET /vouchers/rule-types, nothing hardcoded here. */}
                <Form.Item
                    label="Rules"
                    tooltip="Restrict where and how this voucher applies. Leave empty to apply to every booking."
                >
                    <VoucherRulesEditor
                        value={rules}
                        onChange={setRules}
                        metadata={ruleMetadata}
                        metadataLoading={ruleMetadataLoading}
                        disabled={isLoading}
                    />
                </Form.Item>

                {/* Image */}
                <Form.Item label="Banner Image">
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            onClick={() => { if (!uploadImage.isPending) fileRef.current?.click(); }}
                            style={{
                                position: "relative",
                                width: 120, height: 68, borderRadius: 8,
                                cursor: uploadImage.isPending ? "default" : "pointer",
                                border: `1px dashed ${imageError ? "#ff4d4f" : "var(--dash-border)"}`, overflow: "hidden",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "var(--dash-bg)", flexShrink: 0,
                            }}
                        >
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="preview"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: uploadImage.isPending ? 0.4 : 1 }}
                                />
                            ) : (
                                <span style={{ fontSize: 12, color: "var(--dash-text-3)" }}>Upload</span>
                            )}
                            {uploadImage.isPending && (
                                <Spin size="small" style={{ position: "absolute" }} />
                            )}
                            {imagePreview && !uploadImage.isPending && (
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<CloseOutlined style={{ fontSize: 11 }} />}
                                    onClick={removeImage}
                                    style={{
                                        position: "absolute", top: 2, right: 2, width: 20, height: 20, minWidth: 20,
                                        padding: 0, background: "rgba(0,0,0,0.45)", color: "#fff", border: "none",
                                    }}
                                />
                            )}
                        </div>
                        <div style={{ fontSize: 12, color: imageError ? "#ff4d4f" : "var(--dash-text-2)" }}>
                            {uploadImage.isPending
                                ? "Uploading…"
                                : imageError
                                    ? (
                                        <>
                                            {imageError}{" "}
                                            {pendingFile && <a onClick={retryUpload}>Retry</a>}
                                        </>
                                    )
                                    : `Optional. Click the box to ${imagePreview ? "replace" : "select"} an image.`}
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
