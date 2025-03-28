import { AxiosRequestConfig } from "axios";
         
interface ApiResponseError extends Error {
    response?:{
        data?: {
            message?: string;
        }
    }
}

export const config = {
    headers: {
        "Content-type" : "application/json",
    },
    withCredential: true
}

export const appJson: AxiosRequestConfig = {
    headers: {
        "Content-type": "application/json"
    }
}

export const pdfConfig: AxiosRequestConfig = {
    headers: {
        "Content-Type":"application/pdf",
    }
}

export const configMultiPart: AxiosRequestConfig = {
    headers: {
        'Content-Type': 'multipart/form-data'
    },
    withCredentials: true
}

export const handleError = (error: ApiResponseError, rejectWithValue: (value: string | unknown) => void) => {
    console.error("Error occured:",error);
    if(error.response && error.response.data && error.response.data.message){
        console.log("Server error:",error.response.data.message);
        return rejectWithValue(error.response.data.message);
    }else if(error.message){
        console.log("Error message",error.message);
        rejectWithValue(error.message)
    }else{
        console.log(error.response,"%%%%%");
        console.log("Generic error handler triggered");
        rejectWithValue("An unknown error occured")
    }
}
