import { type FC } from "react";
import { Modal } from "antd";
import type { Room } from "../types/room.types";
import { useDeleteRoom } from "../hooks/useRooms";

interface Props {
    room: Room | null;
    open: boolean;
    onClose: () => void;
}

const WarningIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="#E8001C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const DeleteRoomModal: FC<Props> = ({ room, open, onClose }) => {
    const { mutate: remove, isPending } = useDeleteRoom();

    const handleDelete = () => {
        if (!room) return;
        remove(room.roomId, { onSuccess: onClose });
    };

    return (
        <Modal
            open={open}
            onCancel={!isPending ? onClose : undefined}
            onOk={handleDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: isPending }}
            cancelButtonProps={{ disabled: isPending }}
            maskClosable={!isPending}
            width={420}
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <WarningIcon />
                    <span>Delete Room</span>
                </div>
            }
            destroyOnHidden
        >
            <div style={{ padding: "4px 0 8px" }}>
                <p style={{ margin: 0, fontSize: 14, color: "var(--dash-text-1)", lineHeight: 1.6 }}>
                    Are you sure you want to delete{" "}
                    <strong>{room?.name}</strong>?
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--dash-text-2)" }}>
                    This action cannot be undone. The room's seats and layout will be permanently removed.
                </p>
            </div>
        </Modal>
    );
};

export default DeleteRoomModal;
