import { type FC, useEffect } from "react";
import { Modal, Form, Input, InputNumber } from "antd";
import type { LoyaltyTierItem, LoyaltyTierPayload } from "../types/loyaltyTier.types";
import { useCreateLoyaltyTier, useUpdateLoyaltyTier } from "../hooks/useLoyaltyTiers";

interface Props {
    mode: "create" | "edit";
    tier?: LoyaltyTierItem | null;
    open: boolean;
    onClose: () => void;
}

/** Form works in whole-percent (0–100) for discountRate — converted to the
 *  API's 0–1 decimal on submit and back to percent when loading edit values. */
interface FormValues {
    tierName: string;
    minPoints: number;
    discountRatePercent: number;
    maxRefundPerMonth: number;
}

const LoyaltyTierModal: FC<Props> = ({ mode, tier, open, onClose }) => {
    const [form] = Form.useForm<FormValues>();
    const { mutate: create, isPending: creating } = useCreateLoyaltyTier();
    const { mutate: update, isPending: updating } = useUpdateLoyaltyTier();

    const isLoading = creating || updating;
    const isEdit = mode === "edit";

    useEffect(() => {
        if (open) {
            if (isEdit && tier) {
                form.setFieldsValue({
                    tierName: tier.tierName,
                    minPoints: tier.minPoints,
                    discountRatePercent: Math.round(tier.discountRate * 100),
                    maxRefundPerMonth: tier.maxRefundPerMonth,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ minPoints: 0, discountRatePercent: 0, maxRefundPerMonth: 0 });
            }
        }
    }, [open, isEdit, tier, form]);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        const payload: LoyaltyTierPayload = {
            tierName: values.tierName.trim(),
            minPoints: values.minPoints,
            discountRate: values.discountRatePercent / 100,
            maxRefundPerMonth: values.maxRefundPerMonth,
        };
        if (isEdit && tier) {
            update({ id: tier.tierID, payload }, { onSuccess: onClose });
        } else {
            create(payload, { onSuccess: onClose });
        }
    };

    return (
        <Modal
            title={isEdit ? "Edit Loyalty Tier" : "Add Loyalty Tier"}
            open={open}
            onOk={handleSubmit}
            onCancel={() => { if (!isLoading) onClose(); }}
            okText={isEdit ? "Save Changes" : "Create Tier"}
            cancelText="Cancel"
            confirmLoading={isLoading}
            maskClosable={!isLoading}
            width={460}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 4 }}>
                <Form.Item
                    label="Tier Name"
                    name="tierName"
                    rules={[
                        { required: true, message: "Tier name is required" },
                        { whitespace: true, message: "Tier name cannot be blank" },
                        { max: 50, message: "Maximum 50 characters" },
                    ]}
                >
                    <Input placeholder="e.g. Silver, Gold, Platinum, MegaVIP" maxLength={50} showCount />
                </Form.Item>

                <Form.Item
                    label="Minimum Points"
                    name="minPoints"
                    tooltip="The loyalty-point threshold a customer must reach to be placed in this tier."
                    rules={[
                        { required: true, message: "Minimum points is required" },
                        { type: "number", min: 0, message: "Minimum points cannot be negative" },
                    ]}
                >
                    <InputNumber
                        min={0}
                        step={100}
                        style={{ width: "100%" }}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(v) => Number((v ?? "").replace(/,/g, "")) as 0}
                    />
                </Form.Item>

                <Form.Item
                    label="Discount Rate"
                    name="discountRatePercent"
                    tooltip="Percentage discount applied to bookings for members in this tier."
                    rules={[
                        { required: true, message: "Discount rate is required" },
                        { type: "number", min: 0, max: 100, message: "Must be between 0 and 100" },
                    ]}
                >
                    <InputNumber min={0} max={100} step={1} style={{ width: "100%" }} suffix="%" />
                </Form.Item>

                <Form.Item
                    label="Max Refunds / Month"
                    name="maxRefundPerMonth"
                    tooltip="How many refund requests a member in this tier may submit per calendar month."
                    rules={[
                        { required: true, message: "Max refunds per month is required" },
                        { type: "number", min: 0, message: "Cannot be negative" },
                    ]}
                >
                    <InputNumber min={0} step={1} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default LoyaltyTierModal;
