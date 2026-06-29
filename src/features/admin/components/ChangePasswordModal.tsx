import { type FC, useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import type { AdminUser } from "../types/user.types";
import { useChangePassword } from "../hooks/useChangePassword";
import { passwordRules, confirmPasswordRules } from "../schemas/user.schema";

interface Props {
    user: AdminUser | null;
    open: boolean;
    onClose: () => void;
    onMutationStart?: () => void;
    onMutationEnd?: () => void;
}

const ChangePasswordModal: FC<Props> = ({ user, open, onClose, onMutationStart, onMutationEnd }) => {
    const [form] = Form.useForm();
    const { mutate: changePassword, isPending } = useChangePassword();

    useEffect(() => {
        if (!open) form.resetFields();
    }, [open, form]);

    const handleSubmit = (values: { password: string; confirmPassword: string }) => {
        if (!user) return;
        onMutationStart?.();
        changePassword(
            { userId: user.userId, payload: values },
            {
                onSuccess: () => { onClose(); onMutationEnd?.(); },
                onError: () => { onMutationEnd?.(); },
            },
        );
    };

    return (
        <Modal
            title={`Change Password — ${user?.fullName ?? ""}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={420}
            maskClosable={false}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                <Form.Item name="password" label="New Password" rules={passwordRules}>
                    <Input.Password placeholder="Min 8 chars, uppercase, number, special" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={["password"]}
                    rules={confirmPasswordRules(form.getFieldValue.bind(form))}
                >
                    <Input.Password placeholder="Repeat new password" />
                </Form.Item>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                    <Button onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isPending}
                        style={{ background: "#E8001C", borderColor: "#E8001C" }}
                    >
                        Change Password
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal;
