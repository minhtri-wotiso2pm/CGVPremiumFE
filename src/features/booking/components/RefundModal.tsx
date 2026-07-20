import { type FC } from "react";
import { Modal, Form, Input, Button } from "antd";
import { useRequestRefund } from "../hooks/useRefund";
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

const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const RefundModal: FC<Props> = ({ open, booking, onClose }) => {
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
            title={<span className={styles.title}>Request Refund</span>}
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
                            <span className={styles.summaryLabel}>Movie</span>
                            <span className={styles.summaryValue}>{booking.movieTitle}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Booking Code</span>
                            <span className={styles.summaryValue}>{booking.bookingCode}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Refund Amount</span>
                            <span className={styles.summaryAmount}>{fmtVnd(booking.finalAmount)}</span>
                        </div>
                    </div>

                    <Form.Item
                        name="reason"
                        label={<span className={styles.label}>Reason for Refund</span>}
                        className={styles.item}
                        rules={[
                            { required: true, message: "Please tell us why you want to cancel" },
                            { max: 500, message: "Maximum 500 characters" },
                        ]}
                    >
                        <Input.TextArea
                            placeholder="E.g. I can no longer attend this showtime..."
                            className={styles.textarea}
                            rows={3}
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <div className={styles.warning}>
                        The full amount will be refunded to your wallet. This action cannot be undone, and refunds are
                        only accepted more than 30 minutes before the showtime starts and before you've checked in.
                    </div>

                    <div className={styles.footer}>
                        <Button onClick={handleCancel} className={styles.cancelBtn} disabled={isPending}>
                            Keep Booking
                        </Button>
                        <Button htmlType="submit" loading={isPending} className={styles.confirmBtn} type="primary" danger>
                            Confirm Refund
                        </Button>
                    </div>
                </Form>
            )}
        </Modal>
    );
};

export default RefundModal;
