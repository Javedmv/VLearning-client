import { createSlice } from "@reduxjs/toolkit";
import {  loginUser, signUpUser, getUserDataFirst } from "../actions/user/userAction";

const initialState = {
    loading: false as Boolean,
    user : null as any | null,
    error : null as any | null
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateError : (state, {payload}) => {
            state.error = payload;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(signUpUser.pending, (state) => {
            state.loading = true;
        })
        .addCase(signUpUser.fulfilled, (state, {payload}) => {
            state.loading = false;
            state.error = null;
            state.user = payload;
        })
        .addCase(signUpUser.rejected, (state, {payload}) => {
            state.loading = false;
            state.user = null;
            state.error = payload;
        })
        .addCase(loginUser.pending, (state) => {
            state.loading = true;
        })
        .addCase(loginUser.fulfilled, (state, {payload}) => {
            state.loading = false;
            state.error = null;
            state.user = payload;
        })
        .addCase(loginUser.rejected, (state, {payload}) => {
            state.loading = false;
            state.user = null;
            state.error = payload;
        })
        .addCase(getUserDataFirst.pending, (state) => {
            state.loading = true;
        })
        .addCase(getUserDataFirst.fulfilled, (state, {payload}) => {
            state.loading = false;
            state.error = null;
            state.user = payload
        })
        .addCase(getUserDataFirst.rejected, (state, {payload}) => {
            state.loading = false;
            state.user = null;
            state.error = payload;
        })
    }
})

export const { updateError } = userSlice.actions;

export default userSlice.reducer;


        // .addCase(updateFormData.pending, (state) => {
        //     state.loading = true;
        // })
        // .addCase(updateFormData.fulfilled, (state, {payload}) => {
        //     state.loading = false;
        //     state.error = null;
        //     state.user = payload
        // })
        // .addCase(updateFormData.rejected, (state, {payload}) => {
        //     state.loading = false;
        //     state.user = null;
        //     state.error = payload;
        // })