import axios, {AxiosError, AxiosRequestConfig, Method} from "axios";
import { TOBE } from "./constants";

export const URL = import.meta.env.VITE_REACT_APP_BASE_URL
// export const URL = http://localhost:3000

const appInstance = axios.create({
    baseURL: URL,
    withCredentials:true
});

// response interceptors
appInstance.interceptors.response.use((response) => {
    return response.data
},(error: AxiosError) => {
    throw error
});

export const commonRequest = async (
    method: Method,
    route: string,
    body?: any,
    config: AxiosRequestConfig = {}): Promise<any> => {
        const requestConfig:AxiosRequestConfig = {
            method,
            url: route,
            data: body,
            headers: config.headers,
            withCredentials: true
        }

        try {
            return await appInstance(requestConfig);
        } catch (error:any) {
            if (error.response) {
                console.error("Error response:", error.response.data); // Log response error
            } else {
                console.error("Request error:", error.message); // Log other errors
            }
            throw error;           
        }
    };

export const commonReduxRequest = async (
    method: Method,
    route: string,
    rejectWithValue?: (error:AxiosError) => void,
    body?: any,
    config: AxiosRequestConfig = {}
): Promise<any> => {
    const requestConfig: AxiosRequestConfig = {
        method,
        url: route,
        data: body,
        headers: config.headers || {},
        withCredentials: true
    };

    try {
        const response = await appInstance(requestConfig);
        console.log(response)
        return response.data; // Return only the response data
    } catch (error: TOBE) {
        console.error("Request failed with error in commonReduxRequest in redux/api:", error);
        if (rejectWithValue) {
            return rejectWithValue(
            error.response?.data?.message || error.message || "Unknown error occurred"
        ); // Return a simple string or message
    } else {
      throw error;
    }
  }
};