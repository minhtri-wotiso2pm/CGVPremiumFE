export interface User {
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

export interface RegisterRequest {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export interface RegisterResponse {
    message: string;
    userId: number;
    verificationEmailSent: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    user: User | null;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export interface RegisterEmailResponse {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export interface RegisterVerifyEmailRequest {
    code: string;
}

export interface RegisterVerifyEmailResponse {
    message: string;
    success: boolean;
}