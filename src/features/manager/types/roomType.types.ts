export interface RoomTypeItem {
    roomTypeId: number;
    typeName: string;
    extraPrice: number;
    description: string;
}

export interface CreateRoomTypePayload {
    typeName: string;
    extraPrice: number;
    description: string;
}

export type UpdateRoomTypePayload = CreateRoomTypePayload;

export type RoomTypeModalType = "create" | "edit" | "delete";
