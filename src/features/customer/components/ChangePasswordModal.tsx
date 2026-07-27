import { type FC } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, Button } from "antd";
import { useSelfChangePassword } from "../hooks/useSelfChangePassword";
import styles from "./ChangePasswordModal.module.css";

interface Props {
    open: boolean;
    onClose: () => void;
}

const ChangePasswordModal: FC<Props> = ({ open, onClose }) => {
    const { t } = useTranslation("profile");
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
            title={<span className={styles.title}>{t("card.changePassword")}</span>}
            footer={null}
            destroyOnClose
            styles={{
                container: { background: "#1a0f0f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" },
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
                    label={<span className={styles.label}>{t("passwordModal.current")}</span>}
                    className={styles.item}
                    rules={[{ required: true, message: t("validation.currentPasswordRequired") }]}
                >
                    <Input.Password
                        placeholder={t("passwordModal.currentPlaceholder")}
                        autoComplete="current-password"
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label={<span className={styles.label}>{t("passwordModal.new")}</span>}
                    className={styles.item}
                    rules={[
                        { required: true, message: t("validation.newPasswordRequired") },
                        { min: 6, message: t("validation.passwordMin") },
                        { pattern: /[A-Z]/, message: t("validation.passwordUppercase") },
                        { pattern: /\d/, message: t("validation.passwordDigit") },
                        { pattern: /[@$!%*?&#^()\-_+=]/, message: t("validation.passwordSpecial") },
                    ]}
                >
                    <Input.Password
                        placeholder={t("passwordModal.newPlaceholder")}
                        autoComplete="new-password"
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label={<span className={styles.label}>{t("passwordModal.confirm")}</span>}
                    className={styles.item}
                    dependencies={["newPassword"]}
                    rules={[
                        { required: true, message: t("validation.confirmPasswordRequired") },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error(t("validation.passwordsMismatch")));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        placeholder={t("passwordModal.confirmPlaceholder")}
                        autoComplete="new-password"
                        className={styles.input}
                    />
                </Form.Item>

                <p className={styles.hint}>
                    {t("passwordModal.hint")}
                </p>

                <div className={styles.footer}>
                    <Button onClick={handleCancel} className={styles.cancelBtn} disabled={isPending}>
                        {t("common:actions.cancel")}
                    </Button>
                    <Button htmlType="submit" loading={isPending} className={styles.saveBtn} type="primary">
                        {t("editModal.saveChanges")}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal;
