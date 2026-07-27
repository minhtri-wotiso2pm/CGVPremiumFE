import { type FC } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, Button } from "antd";
import { useRequestRefund } from "../hooks/useRefund";
import { formatVnd } from "@/utils/formatCurrency";
import styles from "./RefundModal.module.css";

export interface RefundBookingInfo {
    bookingID: number;
    bookingCode: string;
    movieTitle: string;
    finalAmount: number;
}

interface Props {
    open: boolean;
    booking: RefundBookingInfo | null;
    onClose: () => void;
}

const RefundModal: FC<Props> = ({ open, booking, onClose }) => {
    const { t } = useTranslation("booking");
    const [form] = Form.useForm<{ reason: string }>();
    const { mutate, isPending } = useRequestRefund(() => {
        form.resetFields();
        onClose();
    });

    const handleFinish = (values: { reason: string }) => {
        if (!booking) return;
        mutate({ bookingId: booking.bookingID, reason: values.reason });
    };

    const handleCancel = () => {
        if (isPending) return;
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            title={<span className={styles.title}>{t("profile:tickets.requestRefund")}</span>}
            footer={null}
            destroyOnClose
            maskClosable={!isPending}
            closable={!isPending}
            styles={{
                container: { background: "#1a0f0f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" },
                header: { background: "#1a0f0f", borderBottom: "1px solid rgba(255,255,255,0.06)" },
                mask: { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.7)" },
            }}
        >
            {booking && (
                <Form form={form} layout="vertical" onFinish={handleFinish} className={styles.form} disabled={isPending}>
                    <div className={styles.summary}>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>{t("refund.movie")}</span>
                            <span className={styles.summaryValue}>{booking.movieTitle}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>{t("confirm.bookingCode")}</span>
                            <span className={styles.summaryValue}>{booking.bookingCode}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>{t("refund.amount")}</span>
                            <span className={styles.summaryAmount}>{formatVnd(booking.finalAmount)}</span>
                        </div>
                    </div>

                    <Form.Item
                        name="reason"
                        label={<span className={styles.label}>{t("refund.reasonLabel")}</span>}
                        className={styles.item}
                        rules={[
                            { required: true, message: t("refund.reasonRequired") },
                            { max: 500, message: t("refund.reasonMax") },
                        ]}
                    >
                        <Input.TextArea
                            placeholder={t("refund.reasonPlaceholder")}
                            className={styles.textarea}
                            rows={3}
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <div className={styles.warning}>
                        {t("refund.warning")}
                    </div>

                    <div className={styles.footer}>
                        <Button onClick={handleCancel} className={styles.cancelBtn} disabled={isPending}>
                            {t("refund.keepBooking")}
                        </Button>
                        <Button htmlType="submit" loading={isPending} className={styles.confirmBtn} type="primary" danger>
                            {t("refund.confirm")}
                        </Button>
                    </div>
                </Form>
            )}
        </Modal>
    );
};

export default RefundModal;
