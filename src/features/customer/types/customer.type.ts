export interface Customer {
    userID: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    avatarURL: string | null;
    totalPoints: number;
    createdAt: string;
}

export interface UserProfileResponse {
    userID: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    avatarURL: string | null;
    totalPoints: number;
    createdAt: string;
}
