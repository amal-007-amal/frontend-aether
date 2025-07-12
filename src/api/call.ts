import { getApiClient } from "./axios";

//get call details 
export const getCalls = async (params:any): Promise<any> => {
    const apiClient = getApiClient();
    const token = localStorage.getItem('aether_access_token') 
    const { data } = await apiClient.get('/api/v1/calls', {
        headers: {
            "Authorization": `Bearer ${token}`
        },
        params:params
    })
    return data
}

//get recordings
export const getRecording = async(recordingid:any):Promise<any>=>{
    const apiClient = getApiClient();
    const token = localStorage.getItem('aether_access_token')
        const response = await apiClient.get(`/api/v1/calls/recordings/${recordingid}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    console.log("reposn mp3 ",response)
    return response.data
}

//get call optmized 
export const getCallsOptimized = async (params?:any): Promise<any> => {
    const apiClient = getApiClient();
    const token = localStorage.getItem('aether_access_token') 
    const { data } = await apiClient.get(`/api/v1/calls/optimized?${params}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        },
    })
    return data
}