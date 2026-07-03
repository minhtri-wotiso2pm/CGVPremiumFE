import { type FC } from "react";
import { Modal, Form, Input, Button } from "antd";
import { useSelfChangePassword } from "@/features/customer/hooks/useSelfChangePassword";
import type { Rule } from "antd/es/form";

const newPasswordRules: Rule[] = [
    { required: true, message: "Vui lòng nhập mật khẩu mới" },
    { min: 6, message: "Tối thiểu 6 ký tự" },
    {
        pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_+=])/,
        message: "Cần ít nhất 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt",
    },
];

interface Props {
    open: boolean;
    onClose: () => void;
}

const ChangeOwnPasswordModal: FC<Props> = ({ open, onClose }) => {
    const [form] = Form.useForm();

    const { mutate, isPending } = useSelfChangePassword(() => {
        form.resetFields();
        onClose();
    });

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleSubmit = (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
        mutate(values);
    };

    return (
        <Modal
            title="Đổi mật khẩu"
            open={open}
            onCancel={handleClose}
            footer={null}
            width={420}
            maskClosable={false}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                <Form.Item
                    name="oldPassword"
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" autoComplete="current-password" />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={newPasswordRules}
                >
                    <Input.Password placeholder="Nhập mật khẩu mới" autoComplete="new-password" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    dependencies={["newPassword"]}
                    rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                                return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" />
                </Form.Item>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                    <Button onClick={handleClose} disabled={isPending}>Hủy</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isPending}
                        style={{ background: "#E8001C", borderColor: "#E8001C" }}
                    >
                        Đổi mật khẩu
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ChangeOwnPasswordModal;
