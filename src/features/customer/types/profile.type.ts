export interface ProfileCinema {
    cinemaId: number;
    cinemaName: string;
    address: string;
    status: string;
}

export interface ProfileResponse {
    userID: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    avatarURL: string | null;
    totalPoints: number;
    createdAt: string;
    cinema?: ProfileCinema | null;
}
export interface UpdateProfilePayload {
    fullName: string;
    phone: string;
}