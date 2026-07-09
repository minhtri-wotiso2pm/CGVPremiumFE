import { type FC, useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import type { Room, CreateRoomPayload, RoomStatus } from "../types/room.types";
import { ROOM_STATUS_OPTIONS } from "../constants/room.constants";
import {
    roomNameRules,
    roomTypeRules,
    roomStatusRules,
    roomDescriptionRules,
} from "../schemas/room.schema";
import { useCreateRoom, useUpdateRoom } from "../hooks/useRooms";
import { useRoomTypes } from "../hooks/useRoomTypes";

interface Props {
    mode: "create" | "edit";
    room?: Room | null;
    cinemaId: number;
    open: boolean;
    onClose: () => void;
}

interface FormValues {
    name: string;
    roomTypeId: number;
    status: RoomStatus;
    description: string;
}

const formatVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const RoomModal: FC<Props> = ({ mode, room, cinemaId, open, onClose }) => {
    const [form] = Form.useForm<FormValues>();
    const { mutate: create, isPending: creating } = useCreateRoom();
    const { mutate: update, isPending: updating } = useUpdateRoom();
    const { data: roomTypes = [], isLoading: roomTypesLoading } = useRoomTypes();

    const isLoading = creating || updating;
    const isEdit = mode === "edit";

    const roomTypeOptions = roomTypes.map((t) => ({
        value: t.roomTypeId,
        label: t.extraPrice > 0 ? `${t.typeName} (+${formatVnd(t.extraPrice)})` : t.typeName,
    }));

    useEffect(() => {
        if (open) {
            if (isEdit && room) {
                form.setFieldsValue({
                    name: room.name,
                    roomTypeId: room.roomTypeId,
                    status: room.status,
                    description: room.description,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ status: "ACTIVE" });
            }
        }
    }, [open, isEdit, room, form]);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        const payload: CreateRoomPayload = {
            cinemaId,
            name: values.name.trim(),
            roomTypeId: values.roomTypeId,
            status: values.status,
            description: (values.description ?? "").trim(),
        };
        if (isEdit && room) {
            update({ roomId: room.roomId, payload }, { onSuccess: onClose });
        } else {
            create(payload, { onSuccess: onClose });
        }
    };

    return (
        <Modal
            title={isEdit ? "Edit Room" : "Add New Room"}
            open={open}
            onOk={handleSubmit}
            onCancel={() => { if (!isLoading) onClose(); }}
            okText={isEdit ? "Save Changes" : "Create Room"}
            cancelText="Cancel"
            confirmLoading={isLoading}
            maskClosable={!isLoading}
            width={480}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 4 }}>
                <Form.Item label="Room Name" name="name" rules={roomNameRules}>
                    <Input placeholder="e.g. Room 01" maxLength={100} showCount />
                </Form.Item>

                <Form.Item label="Room Type" name="roomTypeId" rules={roomTypeRules}>
                    <Select
                        placeholder={roomTypesLoading ? "Loading room types..." : "Select room type"}
                        options={roomTypeOptions}
                        loading={roomTypesLoading}
                        showSearch
                        optionFilterProp="label"
                    />
                </Form.Item>

                <Form.Item label="Status" name="status" rules={roomStatusRules}>
                    <Select
                        placeholder="Select status"
                        options={ROOM_STATUS_OPTIONS.map((o) => ({
                            value: o.value,
                            label: (
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{
                                        width: 6, height: 6, borderRadius: "50%",
                                        background: o.value === "ACTIVE" ? "#22c55e" : "#9ca3af",
                                        flexShrink: 0, display: "inline-block",
                                    }} />
                                    {o.label}
                                </span>
                            ),
                        }))}
                    />
                </Form.Item>

                <Form.Item label="Description" name="description" rules={roomDescriptionRules}>
                    <Input.TextArea
                        placeholder="Optional notes about this room"
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

export default RoomModal;
