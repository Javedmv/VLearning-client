import { createAsyncThunk } from "@reduxjs/toolkit";
import { commonReduxRequest, URL } from "../../../common/api";
import { config,  configMultiPart,  handleError } from "../../../common/configurations";

// signUpUser
export const signUpUser = createAsyncThunk("user/signUpUser", async(userCredentials:any, {rejectWithValue}) => {
    try {        
        const response = await commonReduxRequest(
            "POST",
            `${URL}/auth/signup`,
            rejectWithValue,
            userCredentials,
            config
        );
        return response;
    } catch (error:any) {
        return handleError(error, rejectWithValue);    
    }
});

export const loginUser = createAsyncThunk("user/login", async(userCredentials: any ,{rejectWithValue}) => {
    try {
        const response = await commonReduxRequest(
            "POST",
            `${URL}/auth/login`,
            rejectWithValue,
            userCredentials,
            config
        );
        console.log(response,"response return in redux")
        return response;
    } catch (error:any) {
        return rejectWithValue(error.payload?.response?.data?.message || "Login failed");
    }
})

export const getUserDataFirst = createAsyncThunk("user/getUserDataFirst", async(_, {rejectWithValue}) => {
    try {
        const response = await commonReduxRequest(
            "GET",
            `${URL}/auth/`,
            rejectWithValue,
            config
        )
        console.log(response, "response return in landing page of redux")
        return response
    } catch (error) {
        return rejectWithValue(error)
    }
})

export const logout = createAsyncThunk("user/logout", async( _ , {rejectWithValue}) => {
    try {
        await commonReduxRequest("POST",`${URL}/auth/logout`,rejectWithValue, config)
    } catch (error) {
        console.log(error," error in redux-aciton LOGOUT")
        return rejectWithValue(error);
    }
})

export const userForm = createAsyncThunk("user/updateFormData", async(userCredentials: any ,{rejectWithValue}) => {
    try {
        await commonReduxRequest("POST",`${URL}/auth/multipart/user-form`,rejectWithValue,userCredentials, configMultiPart)
    } catch (error) {
        console.log(error,"error in redux");        
        return rejectWithValue(error)
    }
})