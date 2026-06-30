export type CinemaStatus = "ACTIVE" | "INACTIVE";

export interface Cinema {
    cinemaId: number;
    cinemaName: string;
    address: string;
    status: CinemaStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCinemaPayload {
    cinemaName: string;
    address: string;
    status: CinemaStatus;
}

export type UpdateCinemaPayload = CreateCinemaPayload;

export type CinemaModalType = "create" | "edit" | "delete";
