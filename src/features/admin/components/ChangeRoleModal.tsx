import { type FC, useEffect } from "react";
import { Modal, Form, Select, Button } from "antd";
import type { AdminUser } from "../types/user.types";
import { useChangeRole } from "../hooks/useChangeRole";
import { roleRules, cinemaIdRules } from "../schemas/user.schema";
import { ROLE_OPTIONS } from "../constants/admin.constants";
import CinemaSelect from "./CinemaSelect";

/** Only Staff and Manager are scoped to a cinema — Admin and Customer are not. */
const ROLES_REQUIRING_CINEMA = ["staff", "manager"];

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
                cinemaId: ROLES_REQUIRING_CINEMA.includes(user.role) ? user.cinemaId : undefined,
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

                {/* Cinema — only for Staff / Manager roles */}
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.role !== curr.role}>
                    {({ getFieldValue }) =>
                        ROLES_REQUIRING_CINEMA.includes(getFieldValue("role")) ? (
                            <Form.Item name="cinemaId" label="Cinema" rules={cinemaIdRules}>
                                <CinemaSelect />
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
