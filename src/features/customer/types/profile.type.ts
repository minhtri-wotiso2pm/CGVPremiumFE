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
}
export interface UpdateProfilePayload {
    fullName: string;
    phone: string;
}