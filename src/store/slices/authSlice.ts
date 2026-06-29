import {
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";

import type {
    AuthState,
    User,
} from "@/features/auth/types/auth.type";

type LoginSuccessPayload = {
    accessToken: string;
    user: User;
};

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

const storedToken =
    localStorage.getItem(ACCESS_TOKEN_KEY);

const storedUser =
    localStorage.getItem(USER_KEY);

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
        /**
         * Login success
         */
        loginSuccess: (
            state,
            action: PayloadAction<LoginSuccessPayload>
        ) => {
            const {
                accessToken,
                user,
            } = action.payload;

            state.isAuthenticated = true;
            state.accessToken = accessToken;
            state.user = user;

            localStorage.setItem(
                ACCESS_TOKEN_KEY,
                accessToken
            );

            localStorage.setItem(
                USER_KEY,
                JSON.stringify(user)
            );
        },

        updateUserInfo: (
            state,
            action: PayloadAction<Partial<User>>
        ) => {
            if (!state.user) return;

            state.user = {
                ...state.user,
                ...action.payload,
            };

            localStorage.setItem(
                USER_KEY,
                JSON.stringify(state.user)
            );
        },

        logout: (state) => {
            localStorage.removeItem(
                ACCESS_TOKEN_KEY
            );

            localStorage.removeItem(
                USER_KEY
            );

            state.isAuthenticated = false;
            state.accessToken = null;
            state.user = null;
        },
    },
});

export const {
    loginSuccess,
    updateUserInfo,
    logout,
} = authSlice.actions;

export default authSlice.reducer;