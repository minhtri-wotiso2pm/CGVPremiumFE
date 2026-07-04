import { type FC, useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { useCreateUser } from "../hooks/useCreateUser";
import {
    nameRules, emailRules, phoneRules, passwordRules,
    roleRules, statusRules, cinemaIdRules,
} from "../schemas/user.schema";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "../constants/admin.constants";
import CinemaSelect from "./CinemaSelect";

/** Only Staff and Manager are scoped to a cinema — Admin and Customer are not. */
const ROLES_REQUIRING_CINEMA = ["staff", "manager"];

interface Props {
    open: boolean;
    onClose: () => void;
    onMutationStart?: () => void;
    onMutationEnd?: () => void;
}

const CreateUserModal: FC<Props> = ({ open, onClose, onMutationStart, onMutationEnd }) => {
    const [form] = Form.useForm();
    const { mutate: createUser, isPending } = useCreateUser();

    useEffect(() => {
        if (!open) form.resetFields();
    }, [open, form]);

    const handleSubmit = (values: {
        fullName: string; email: string; phone: string;
        password: string; role: string; status: string; cinemaId?: number;
    }) => {
        onMutationStart?.();
        createUser(values, {
            onSuccess: () => { onClose(); onMutationEnd?.(); },
            onError: () => { onMutationEnd?.(); },
        });
    };

    return (
        <Modal
            title="Add New User"
            open={open}
            onCancel={onClose}
            footer={null}
            width={520}
            maskClosable={false}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                <Form.Item name="fullName" label="Full Name" rules={nameRules}>
                    <Input placeholder="Enter full name" />
                </Form.Item>

                <Form.Item name="email" label="Email" rules={emailRules}>
                    <Input placeholder="Enter email address" />
                </Form.Item>

                <Form.Item name="phone" label="Phone" rules={phoneRules}>
                    <Input placeholder="Enter phone number" />
                </Form.Item>

                <Form.Item name="password" label="Password" rules={passwordRules}>
                    <Input.Password placeholder="Min 8 chars, uppercase, number, special" />
                </Form.Item>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Form.Item name="role" label="Role" rules={roleRules}>
                        <Select
                            options={ROLE_OPTIONS}
                            placeholder="Select role"
                            onChange={() => form.setFieldValue("cinemaId", undefined)}
                        />
                    </Form.Item>
                    <Form.Item name="status" label="Status" rules={statusRules}>
                        <Select options={STATUS_OPTIONS} placeholder="Select status" />
                    </Form.Item>
                </div>

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
                        Create User
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateUserModal;
