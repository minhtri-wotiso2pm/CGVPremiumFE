import { type FC, useEffect } from "react";
import { Modal, Form, Input, InputNumber } from "antd";
import type { SeatType, SeatTypePayload } from "@/features/manager/types/room.types";
import {
    seatTypeNameRules,
    seatTypeCapacityRules,
    seatTypeExtraPriceRules,
} from "@/features/manager/schemas/room.schema";
import { useCreateSeatType, useUpdateSeatType } from "@/features/manager/hooks/useSeatTypes";

interface Props {
    mode: "create" | "edit";
    seatType?: SeatType | null;
    open: boolean;
    onClose: () => void;
}

const SeatTypeModal: FC<Props> = ({ mode, seatType, open, onClose }) => {
    const [form] = Form.useForm<SeatTypePayload>();
    const { mutate: create, isPending: creating } = useCreateSeatType();
    const { mutate: update, isPending: updating } = useUpdateSeatType();

    const isLoading = creating || updating;
    const isEdit = mode === "edit";

    useEffect(() => {
        if (open) {
            if (isEdit && seatType) {
                form.setFieldsValue({
                    typeName: seatType.typeName,
                    capacity: seatType.capacity,
                    extraPrice: seatType.extraPrice,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ capacity: 1, extraPrice: 0 });
            }
        }
    }, [open, isEdit, seatType, form]);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        const payload: SeatTypePayload = {
            typeName: values.typeName.trim(),
            capacity: values.capacity,
            extraPrice: values.extraPrice,
        };
        if (isEdit && seatType) {
            update({ seatTypeId: seatType.seatTypeId, payload }, { onSuccess: onClose });
        } else {
            create(payload, { onSuccess: onClose });
        }
    };

    return (
        <Modal
            title={isEdit ? "Edit Seat Type" : "Add Seat Type"}
            open={open}
            onOk={handleSubmit}
            onCancel={() => { if (!isLoading) onClose(); }}
            okText={isEdit ? "Save Changes" : "Create Seat Type"}
            cancelText="Cancel"
            confirmLoading={isLoading}
            maskClosable={!isLoading}
            width={440}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 4 }}>
                <Form.Item label="Type Name" name="typeName" rules={seatTypeNameRules}>
                    <Input placeholder="e.g. Standard, VIP, Couple" maxLength={50} showCount />
                </Form.Item>

                <Form.Item
                    label="Capacity (seats occupied)"
                    name="capacity"
                    rules={seatTypeCapacityRules}
                    tooltip="How many people this seat holds — e.g. a Couple seat = 2."
                >
                    <InputNumber min={1} max={10} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    label="Extra Price (VND)"
                    name="extraPrice"
                    rules={seatTypeExtraPriceRules}
                    tooltip="Added on top of the showtime base price for this seat type."
                >
                    <InputNumber
                        min={0}
                        step={1000}
                        style={{ width: "100%" }}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(v) => Number((v ?? "").replace(/,/g, "")) as 0}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SeatTypeModal;
