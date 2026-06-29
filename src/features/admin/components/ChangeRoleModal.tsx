import { type FC, useEffect } from "react";
import { Modal, Form, Select, InputNumber, Button } from "antd";
import type { AdminUser } from "../types/user.types";
import { useChangeRole } from "../hooks/useChangeRole";
import { roleRules, cinemaIdRules } from "../schemas/user.schema";
import { ROLE_OPTIONS } from "../constants/admin.constants";

interface Props {
    user: AdminUser | null;
    open: boolean;
    onClose: () => void;
    onMutationStart?: () => void;
    onMutationEnd?: () => void;
}

const ChangeRoleModal: FC<Props> = ({ user, open, onClose, onMutationStart, onMutationEnd }) => {
    const [form] = Form.useForm();
    const { mutate: changeRole, isPending } = useChangeRole();

    useEffect(() => {
        if (open && user) {
            form.setFieldsValue({
                role: user.role,
                cinemaId: user.role !== "customer" ? user.cinemaId : undefined,
            });
        } else {
            form.resetFields();
        }
    }, [open, user, form]);

    const handleSubmit = (values: { role: string; cinemaId?: number }) => {
        if (!user) return;
        onMutationStart?.();
        changeRole(
            { userId: user.userId, payload: values },
            {
                onSuccess: () => { onClose(); onMutationEnd?.(); },
                onError: () => { onMutationEnd?.(); },
            },
        );
    };

    return (
        <Modal
            title={`Change Role — ${user?.fullName ?? ""}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={400}
            maskClosable={false}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                <Form.Item name="role" label="New Role" rules={roleRules}>
                    <Select
                        options={ROLE_OPTIONS}
                        onChange={() => form.setFieldValue("cinemaId", undefined)}
                    />
                </Form.Item>

                {/* Cinema ID — only for non-customer roles */}
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.role !== curr.role}>
                    {({ getFieldValue }) =>
                        getFieldValue("role") && getFieldValue("role") !== "customer" ? (
                            <Form.Item name="cinemaId" label="Cinema ID" rules={cinemaIdRules}>
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        ) : null
                    }
                </Form.Item>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                    <Button onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isPending}
                        style={{ background: "#E8001C", borderColor: "#E8001C" }}
                    >
                        Update Role
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ChangeRoleModal;
