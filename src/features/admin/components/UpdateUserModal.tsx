import { type FC, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button } from "antd";
import type { AdminUser } from "../types/user.types";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { nameRules, emailRules, phoneRules, cinemaIdRules } from "../schemas/user.schema";

interface Props {
    user: AdminUser | null;
    open: boolean;
    onClose: () => void;
    onMutationStart?: () => void;
    onMutationEnd?: () => void;
}

const UpdateUserModal: FC<Props> = ({ user, open, onClose, onMutationStart, onMutationEnd }) => {
    const [form] = Form.useForm();
    const { mutate: updateUser, isPending } = useUpdateUser();

    const isNonCustomer = user?.role !== "customer";

    useEffect(() => {
        if (open && user) {
            form.setFieldsValue({
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                ...(isNonCustomer ? { cinemaId: user.cinemaId } : {}),
            });
        } else {
            form.resetFields();
        }
    }, [open, user, form, isNonCustomer]);

    const handleSubmit = (values: {
        fullName: string; email: string; phone: string; cinemaId?: number;
    }) => {
        if (!user) return;
        onMutationStart?.();
        updateUser(
            { userId: user.userId, payload: values },
            {
                onSuccess: () => { onClose(); onMutationEnd?.(); },
                onError: () => { onMutationEnd?.(); },
            },
        );
    };

    return (
        <Modal
            title={`Edit User — ${user?.fullName ?? ""}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={480}
            maskClosable={false}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                <Form.Item name="fullName" label="Full Name" rules={nameRules}>
                    <Input />
                </Form.Item>

                <Form.Item name="email" label="Email" rules={emailRules}>
                    <Input />
                </Form.Item>

                <Form.Item name="phone" label="Phone" rules={phoneRules}>
                    <Input />
                </Form.Item>

                {/* Cinema ID — only for non-customer roles */}
                {isNonCustomer && (
                    <Form.Item name="cinemaId" label="Cinema ID" rules={cinemaIdRules}>
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                    <Button onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isPending}
                        style={{ background: "#E8001C", borderColor: "#E8001C" }}
                    >
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UpdateUserModal;
