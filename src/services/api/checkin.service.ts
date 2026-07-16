import axiosInstance from "@/services/axios/axiosInstance";

export const checkInApi = (qrCode: string) => {
    return axiosInstance.post("/checkins", {
        qrCode,
    });
};