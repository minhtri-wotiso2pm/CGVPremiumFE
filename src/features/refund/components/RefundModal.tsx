import { type FC } from "react";
import { Modal, Form, Input } from "antd";
import { useCreateRefund } from "../hooks/useCreateRefund";

interface Props {
    open: boolean;
    bookingId: number | null;
    onClose: () => void;
}

const RefundModal: FC<Props> = ({
    open,
    bookingId,
    onClose,
}) => {
    const [form] = Form.useForm();

    const { mutate, isPending } = useCreateRefund();

    const handleSubmit = async () => {
        if (!bookingId) return;

        const values = await form.validateFields();

        mutate(
            {
                bookingId,
                reason: values.reason,
            },
            {
                onSuccess: () => {
                    form.resetFields();
                    onClose();
                },
            }
        );
    };

    return (
        <Modal
            title="Refund Ticket"
            open={open}
            onOk={handleSubmit}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            confirmLoading={isPending}
            okText="Refund"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Reason"
                    name="reason"
                    rules={[
                        {
                            required: true,
                            message: "Please enter refund reason",
                        },
                    ]}
                >
                    <Input.TextArea
                        rows={4}
                        placeholder="Please enter your refund reason..."
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RefundModal;