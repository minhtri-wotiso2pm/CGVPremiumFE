import { type FC, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select } from "antd";
import type { Cinema, CreateCinemaPayload, CinemaStatus } from "../types/cinema.types";
import { CINEMA_STATUS_OPTIONS } from "../constants/cinema.constants";
import { cinemaNameRules, addressRules, statusRules, latitudeRules, longitudeRules } from "../schemas/cinema.schema";
import { useCreateCinema } from "../hooks/useCreateCinema";
import { useUpdateCinema } from "../hooks/useUpdateCinema";

interface Props {
    mode: "create" | "edit";
    cinema?: Cinema | null;
    open: boolean;
    onClose: () => void;
}

interface FormValues {
    cinemaName: string;
    address: string;
    status: CinemaStatus;
    latitude: number;
    longitude: number;
}

const CinemaModal: FC<Props> = ({ mode, cinema, open, onClose }) => {
    const [form] = Form.useForm<FormValues>();
    const { mutate: create, isPending: creating } = useCreateCinema();
    const { mutate: update, isPending: updating } = useUpdateCinema();

    const isLoading = creating || updating;
    const isEdit = mode === "edit";

    useEffect(() => {
        if (open) {
            if (isEdit && cinema) {
                form.setFieldsValue({
                    cinemaName: cinema.cinemaName,
                    address: cinema.address,
                    status: cinema.status,
                    latitude: cinema.latitude ?? 0,
                    longitude: cinema.longitude ?? 0,
                });
            } else {
                form.resetFields();
                form.setFieldValue("status", "ACTIVE");
                form.setFieldValue("latitude", 0);
                form.setFieldValue("longitude", 0);
            }
        }
    }, [open, isEdit, cinema, form]);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        const payload: CreateCinemaPayload = {
            cinemaName: values.cinemaName.trim(),
            address: values.address.trim(),
            status: values.status,
            latitude: values.latitude,
            longitude: values.longitude,
        };

        if (isEdit && cinema) {
            update({ cinemaId: cinema.cinemaId, payload }, { onSuccess: onClose });
        } else {
            create(payload, { onSuccess: onClose });
        }
    };

    const handleCancel = () => {
        if (!isLoading) onClose();
    };

    return (
        <Modal
            title={isEdit ? "Edit Cinema" : "Add New Cinema"}
            open={open}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText={isEdit ? "Save Changes" : "Create Cinema"}
            cancelText="Cancel"
            confirmLoading={isLoading}
            maskClosable={!isLoading}
            width={480}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                style={{ marginTop: 4 }}
            >
                <Form.Item
                    label="Cinema Name"
                    name="cinemaName"
                    rules={cinemaNameRules}
                >
                    <Input
                        placeholder="e.g. CGV Vincom Đồng Khởi"
                        maxLength={100}
                        showCount
                    />
                </Form.Item>

                <Form.Item
                    label="Address"
                    name="address"
                    rules={addressRules}
                >
                    <Input.TextArea
                        placeholder="Full address of the cinema"
                        maxLength={200}
                        showCount
                        rows={2}
                        style={{ resize: "none" }}
                    />
                </Form.Item>

                <div style={{ display: "flex", gap: 12 }}>
                    <Form.Item
                        label="Latitude"
                        name="latitude"
                        rules={latitudeRules}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            placeholder="e.g. 10.7769"
                            step={0.000001}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Longitude"
                        name="longitude"
                        rules={longitudeRules}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            placeholder="e.g. 106.7009"
                            step={0.000001}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    label="Status"
                    name="status"
                    rules={statusRules}
                >
                    <Select
                        placeholder="Select status"
                        options={[...CINEMA_STATUS_OPTIONS].map((o) => ({
                            value: o.value,
                            label: (
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{
                                        width: 6, height: 6, borderRadius: "50%",
                                        background: o.value === "ACTIVE" ? "#22c55e" : "#9ca3af",
                                        flexShrink: 0,
                                        display: "inline-block",
                                    }} />
                                    {o.label}
                                </span>
                            ),
                        }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CinemaModal;
