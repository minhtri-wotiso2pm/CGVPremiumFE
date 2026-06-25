import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
    AuthState,
    User,
} from "@/features/auth/types/auth.type";

type LoginSuccessPayload = {
    accessToken: string;
    user: User;
};

const storedToken =
    localStorage.getItem("accessToken");

const storedUser =
    localStorage.getItem("user");

const initialState: AuthState = {
    isAuthenticated: !!storedToken,

    accessToken: storedToken,

    user: storedUser
        ? JSON.parse(storedUser)
        : null,
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        loginSuccess: (
            state,
            action: PayloadAction<LoginSuccessPayload>
        ) => {
            state.isAuthenticated = true;

            state.accessToken =
                action.payload.accessToken;

            state.user =
                action.payload.user;
        },

        logout: (state) => {
            localStorage.removeItem(
                "accessToken"
            );

            localStorage.removeItem(
                "user"
            );

            state.isAuthenticated = false;
            state.accessToken = null;
            state.user = null;
        },

    },
});

export const {
    loginSuccess,
    logout,

} = authSlice.actions;

export default authSlice.reducer;