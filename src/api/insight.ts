import { getApiClient } from "./axios";

export const createInsights = async (payload:any): Promise<any> => {
    const apiClient = getApiClient();
    const token = localStorage.getItem('aether_access_token')
    const { data } = await apiClient.post('/api/v1/nl',payload,{
        headers: {
            "Authorization": `Bearer ${token}`
        },
    })
    return data
}
