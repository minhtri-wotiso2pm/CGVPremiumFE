import { type FC, useEffect } from "react";
import { Modal, Form, Select, Button } from "antd";
import type { AdminUser } from "../types/user.types";
import { useChangeStatus } from "../hooks/useChangeStatus";
import { statusRules } from "../schemas/user.schema";
import { STATUS_OPTIONS } from "../constants/admin.constants";

interface Props {
    user: AdminUser | null;
    open: boolean;
    onClose: () => void;
    onMutationStart?: () => void;
    onMutationEnd?: () => void;
}

const ChangeStatusModal: FC<Props> = ({ user, open, onClose, onMutationStart, onMutationEnd }) => {
    const [form] = Form.useForm();
    const { mutate: changeStatus, isPending } = useChangeStatus();

    useEffect(() => {
        if (open && user) {
            form.setFieldsValue({ status: user.status });
        } else {
            form.resetFields();
        }
    }, [open, user, form]);

    const handleSubmit = (values: { status: string }) => {
        if (!user) return;
        onMutationStart?.();
        changeStatus(
            { userId: user.userId, payload: values },
            {
                onSuccess: () => { onClose(); onMutationEnd?.(); },
                onError: () => { onMutationEnd?.(); },
            },
        );
    };

    return (
        <Modal
            title={`Change Status — ${user?.fullName ?? ""}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={380}
            maskClosable={false}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                <Form.Item name="status" label="New Status" rules={statusRules}>
                    <Select options={STATUS_OPTIONS} />
                </Form.Item>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                    <Button onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isPending}
                        style={{ background: "#E8001C", borderColor: "#E8001C" }}
                    >
                        Update Status
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ChangeStatusModal;
