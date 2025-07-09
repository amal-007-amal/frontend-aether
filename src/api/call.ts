import type { CallLogDetails } from "../types/call"
import { getApiClient } from "./axios";

export const getCalls = async (params:any): Promise<CallLogDetails[]> => {
    const apiClient = getApiClient();
    const token = localStorage.getItem('aether_access_token')
    const { data } = await apiClient.get('/api/v1/calls', {
        headers: {
            "Authorization": `Bearer ${token}`
        },
        params:params
    })
    return data.calls
}


export const getRecording = async(recordingid:any):Promise<Blob>=>{
    const apiClient = getApiClient();
    const token = localStorage.getItem('aether_access_token')
        const response = await apiClient.get(`/api/v1/calls/recordings/${recordingid}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        },
        responseType: 'blob'
    })
    console.log("reposn mp3 ",response)
    return response.data
}