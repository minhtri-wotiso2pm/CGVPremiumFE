import { type FC, useEffect } from "react";
import { Modal, Form, Input, InputNumber } from "antd";
import type { RoomTypeItem, CreateRoomTypePayload } from "@/features/manager/types/roomType.types";
import { useCreateRoomType, useUpdateRoomType } from "@/features/manager/hooks/useRoomTypes";

interface Props {
    mode: "create" | "edit";
    roomType?: RoomTypeItem | null;
    open: boolean;
    onClose: () => void;
}

const RoomTypeModal: FC<Props> = ({ mode, roomType, open, onClose }) => {
    const [form] = Form.useForm<CreateRoomTypePayload>();
    const { mutate: create, isPending: creating } = useCreateRoomType();
    const { mutate: update, isPending: updating } = useUpdateRoomType();

    const isLoading = creating || updating;
    const isEdit = mode === "edit";

    useEffect(() => {
        if (open) {
            if (isEdit && roomType) {
                form.setFieldsValue({
                    typeName: roomType.typeName,
                    extraPrice: roomType.extraPrice,
                    description: roomType.description,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ extraPrice: 0 });
            }
        }
    }, [open, isEdit, roomType, form]);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        const payload: CreateRoomTypePayload = {
            typeName: values.typeName.trim(),
            extraPrice: values.extraPrice,
            description: (values.description ?? "").trim(),
        };
        if (isEdit && roomType) {
            update({ id: roomType.roomTypeId, payload }, { onSuccess: onClose });
        } else {
            create(payload, { onSuccess: onClose });
        }
    };

    return (
        <Modal
            title={isEdit ? "Edit Room Type" : "Add Room Type"}
            open={open}
            onOk={handleSubmit}
            onCancel={() => { if (!isLoading) onClose(); }}
            okText={isEdit ? "Save Changes" : "Create Room Type"}
            cancelText="Cancel"
            confirmLoading={isLoading}
            maskClosable={!isLoading}
            width={460}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 4 }}>
                <Form.Item
                    label="Type Name"
                    name="typeName"
                    rules={[
                        { required: true, message: "Type name is required" },
                        { whitespace: true, message: "Type name cannot be blank" },
                        { max: 50, message: "Maximum 50 characters" },
                    ]}
                >
                    <Input placeholder="e.g. Standard, IMAX, Gold Class" maxLength={50} showCount />
                </Form.Item>

                <Form.Item
                    label="Extra Price (VND)"
                    name="extraPrice"
                    rules={[
                        { required: true, message: "Extra price is required" },
                        { type: "number", min: 0, message: "Extra price cannot be negative" },
                    ]}
                    tooltip={isEdit
                        ? "Added on top of the base price for showtimes in rooms of this type. Changing this only affects showtimes created after saving — existing showtimes keep their original price."
                        : "Added on top of the base price for showtimes in rooms of this type."}
                >
                    <InputNumber
                        min={0}
                        step={1000}
                        style={{ width: "100%" }}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(v) => Number((v ?? "").replace(/,/g, "")) as 0}
                    />
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ max: 250, message: "Maximum 250 characters" }]}
                >
                    <Input.TextArea
                        placeholder="Optional notes about this room type"
                        maxLength={250}
                        showCount
                        rows={2}
                        style={{ resize: "none" }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RoomTypeModal;
