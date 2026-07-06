export type CinemaStatus = "ACTIVE" | "INACTIVE";

export interface Cinema {
    cinemaId: number;
    cinemaName: string;
    address: string;
    status: CinemaStatus;
    createdAt: string;
    updatedAt: string;
    /** Not yet provided by the backend — see the "Theaters map" BE
     *  requirements note. Cinemas without coordinates just get no map pin. */
    latitude?: number | null;
    longitude?: number | null;
}

export interface CreateCinemaPayload {
    cinemaName: string;
    address: string;
    status: CinemaStatus;
    latitude: number;
    longitude: number;
}

export type UpdateCinemaPayload = CreateCinemaPayload;

export type CinemaModalType = "create" | "edit" | "delete";
