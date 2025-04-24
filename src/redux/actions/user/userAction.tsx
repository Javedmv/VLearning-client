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
    } catch (error: unknown) {
        if (error instanceof Error) {
          return handleError(error, rejectWithValue);
        } else {
          const unknownError: Error = new Error('An unknown error occurred');
          return handleError(unknownError, rejectWithValue);
        }
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
    } catch (error: unknown) {
        if (error instanceof Error) {
          return rejectWithValue(error.message || 'Login failed');
        } else if (error && typeof error === 'object' && 'payload' in error) {
          const message = (error as { payload?: { response?: { data?: { message?: string } } } }).payload?.response?.data?.message;
          return rejectWithValue(message || 'Login failed');
        } else {
          return rejectWithValue('Login failed');
        }
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
        return response
    } catch (error: unknown) {
        if (error instanceof Error) {
          return rejectWithValue(error);
        } else {
          return rejectWithValue('An unknown error occurred');
        }
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
        const response = await commonReduxRequest("POST",`${URL}/auth/multipart/user-form`,rejectWithValue,userCredentials, configMultiPart)
        return response
    } catch (error) {
        console.log(error,"error in redux");        
        return rejectWithValue(error)
    }
})

// export const updateUserProfile = createAsyncThunk("user/updateProfile", async(userCredentials: any, {rejectWithValue}) => {
//     try {
//         const response = await commonReduxRequest("POST",`${URL}/auth/profile/${userCredentials._id!}`,rejectWithValue, userCredentials, config)
//         console.log(response,"======================")
//     } catch (error) {
//         console.log(error,"error in redux profileUpdate");        
//         return rejectWithValue(error)
//     }
// })


export const teach = createAsyncThunk("user/teach", async(userCredentials:FormData, {rejectWithValue}) =>  {
    try {
        const response = await commonReduxRequest("POST",`${URL}/auth/multipart/apply-teach`,rejectWithValue, userCredentials, configMultiPart)
        return response
    } catch (error) {
        console.log(error,"error in redux");
        return rejectWithValue(error)
    }
})

export const reapplyInstructor = createAsyncThunk("user/reapplyInstructor", async(userCredentials:FormData, {rejectWithValue}) =>  {
    try {
        const response = await commonReduxRequest("POST",`${URL}/auth/multipart/instructor-reapply`,rejectWithValue, userCredentials, configMultiPart)
        return response
    } catch (error) {
        console.log(error,"error in redux");
        return rejectWithValue(error)
    }
})

export const googleLoginUser = createAsyncThunk("user/googleLogin", async(userCredentials: any ,{rejectWithValue}) => {
    try {
        const response = await commonReduxRequest(
            "POST",
            `${URL}/auth/google-login`,
            rejectWithValue,
            userCredentials,
            config
        );
        console.log(response,"response return in redux")
        return response;
    } catch (error: unknown) {
        if (error instanceof Error && 'payload' in error) {
          return rejectWithValue((error as { payload?: { response?: { data?: { message?: string } } } }).payload?.response?.data?.message || "Login failed");
        } else {
          return rejectWithValue("Login failed");
        }
      }
      
})
