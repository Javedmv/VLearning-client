import { createAsyncThunk } from "@reduxjs/toolkit";
import { commonReduxRequest, URL } from "../../../common/api";
import { config, configMultiPart, handleError } from "../../../common/configurations";

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

// export const updateFormData = createAsyncThunk("user/updateFormData", async(userCredentials: any ,{rejectWithValue}) => {
//     try {
//         await commonReduxRequest("POST",`${URL}/auth/user-form`,rejectWithValue,userCredentials, configMultiPart).then((res) => console.log(res,"res in catch of axios")).catch((err) => console.log(err,"error in catch of axios"))
//     } catch (error) {
//         console.log("error in redux");
        
//         return rejectWithValue(error)
//     }
// })