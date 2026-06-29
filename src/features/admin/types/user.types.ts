export interface AdminUser {
    userId: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    avatarUrl: string | null;
    cinemaId: number | null;
    createdAt: string;
}

export interface GetUsersParams {
    search?: string;
    role?: string;
    status?: string;
    page: number;
    pageSize: number;
}

export interface UserListResponse {
    items: AdminUser[];
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateUserPayload {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    status: string;
    cinemaId?: number;
}

export interface UpdateUserPayload {
    fullName: string;
    email: string;
    phone: string;
    cinemaId?: number;
}

export interface ChangeRolePayload {
    role: string;
    cinemaId?: number;
}

export interface ChangeStatusPayload {
    status: string;
}

export interface ChangePasswordPayload {
    password: string;
    confirmPassword: string;
}

export type UserModalType = "create" | "update" | "role" | "status" | "password" | "delete";
