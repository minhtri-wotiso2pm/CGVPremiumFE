import { type FC } from "react";
import { Modal, Button } from "antd";
import type { AdminUser } from "../types/user.types";
import { useDeleteUser } from "../hooks/useDeleteUser";

const WarnIcon = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#E8001C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

interface Props {
    user: AdminUser | null;
    open: boolean;
    onClose: () => void;
    onMutationStart?: () => void;
    onMutationEnd?: () => void;
}

const DeleteUserModal: FC<Props> = ({ user, open, onClose, onMutationStart, onMutationEnd }) => {
    const { mutate: deleteUser, isPending } = useDeleteUser();

    const handleConfirm = () => {
        if (!user) return;
        onMutationStart?.();
        deleteUser(user.userId, {
            onSuccess: () => { onClose(); onMutationEnd?.(); },
            onError: () => { onMutationEnd?.(); },
        });
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={400}
            maskClosable={!isPending}
            closable={!isPending}
            centered
        >
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <WarnIcon />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1D1D1F", margin: "0 0 8px" }}>
                    Delete User
                </h3>
                <p style={{ fontSize: 13.5, color: "#6E6E73", margin: "0 0 4px" }}>
                    Are you sure you want to delete
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1D1D1F", margin: "0 0 4px" }}>
                    {user?.fullName}
                </p>
                <p style={{ fontSize: 12, color: "#AEAEB2", margin: "0 0 24px" }}>
                    {user?.email}
                </p>
                <p style={{ fontSize: 12, color: "#E8001C", margin: "0 0 24px" }}>
                    This action cannot be undone.
                </p>

                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <Button
                        onClick={onClose}
                        disabled={isPending}
                        style={{ minWidth: 100 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        danger
                        type="primary"
                        loading={isPending}
                        onClick={handleConfirm}
                        style={{ minWidth: 100 }}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteUserModal;
