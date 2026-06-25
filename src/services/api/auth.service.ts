import axiosInstance from "@/services/axios/axiosInstance";

import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    RegisterVerifyEmailRequest,
    RegisterVerifyEmailResponse,
} from "@/features/auth/types/auth.type";

export const loginApi = async (
    payload: LoginRequest
): Promise<LoginResponse> => {
    const response =
        await axiosInstance.post(
            "/auth/login",
            payload
        );

    return response.data;
};

export const registerApi = async (
    payload: RegisterRequest
): Promise<RegisterResponse> => {
    const response = await axiosInstance.post(
        "/auth/register",
        payload
    );

    return response.data;
};

export const forgotPassword = async (
    payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
    const response = await axiosInstance.post(
        "/auth/forgot-password",
        payload
    );

    return response.data;
};


export const resetPassword = async (
    payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
    const response = await axiosInstance.post(
        "/auth/reset-password",
        payload
    );

    return response.data;
};

export const resendVerifyEmail = async (
    payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
    const response = await axiosInstance.post(
        "/auth/resend-verification-email",
        payload
    );

    return response.data;
};

export const verifyEmail = async (
    payload: RegisterVerifyEmailRequest
): Promise<RegisterVerifyEmailResponse> => {
    const response = await axiosInstance.post(
        "/auth/verify-email",
        payload
    );

    return response.data;
};