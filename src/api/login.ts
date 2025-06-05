import { apiClient } from "./axios"

export const postServerUrl = async (payload:any)=>{
    const {data} = await apiClient.post('/enterServerUrl',payload)
    console.log(data)
    return {message:false,data:[]}
}

export const postPhoneNumber = async (payload:any)=>{
    const {data} = await apiClient.post('/enterServerUrl',payload)
    console.log(data)
    return {message:false,data:[]}
}