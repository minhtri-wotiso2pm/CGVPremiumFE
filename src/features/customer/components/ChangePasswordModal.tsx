import { type FC } from "react";
import { Modal, Form, Input, Button } from "antd";
import { useSelfChangePassword } from "../hooks/useSelfChangePassword";
import styles from "./ChangePasswordModal.module.css";

interface Props {
    open: boolean;
    onClose: () => void;
}

const ChangePasswordModal: FC<Props> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const { mutate, isPending } = useSelfChangePassword(() => {
        form.resetFields();
        onClose();
    });

    const handleFinish = (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
        mutate(values);
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            title={<span className={styles.title}>Change Password</span>}
            footer={null}
            destroyOnClose
            styles={{
                content: { background: "#1a0f0f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" },
                header: { background: "#1a0f0f", borderBottom: "1px solid rgba(255,255,255,0.06)" },
                mask: { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.7)" },
            }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className={styles.form}
                disabled={isPending}
            >
                <Form.Item
                    name="oldPassword"
                    label={<span className={styles.label}>Current Password</span>}
                    className={styles.item}
                    rules={[{ required: true, message: "Please enter your current password" }]}
                >
                    <Input.Password
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label={<span className={styles.label}>New Password</span>}
                    className={styles.item}
                    rules={[
                        { required: true, message: "Please enter a new password" },
                        { min: 6, message: "Minimum 6 characters" },
                        { pattern: /[A-Z]/, message: "Must contain at least one uppercase letter" },
                        { pattern: /\d/, message: "Must contain at least one digit" },
                        { pattern: /[@$!%*?&#^()\-_+=]/, message: "Must contain at least one special character" },
                    ]}
                >
                    <Input.Password
                        placeholder="Min 6 chars, 1 uppercase, 1 digit, 1 special"
                        autoComplete="new-password"
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label={<span className={styles.label}>Confirm New Password</span>}
                    className={styles.item}
                    dependencies={["newPassword"]}
                    rules={[
                        { required: true, message: "Please confirm your new password" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Passwords do not match"));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                        className={styles.input}
                    />
                </Form.Item>

                <p className={styles.hint}>
                    Password must be at least 6 characters with one uppercase letter, one digit, and one special character.
                </p>

                <div className={styles.footer}>
                    <Button onClick={handleCancel} className={styles.cancelBtn} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button htmlType="submit" loading={isPending} className={styles.saveBtn} type="primary">
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal;
