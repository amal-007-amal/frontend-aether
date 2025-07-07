import { apiClient } from "./axios"

export const getDashboard = async (params:any): Promise<any> => {
    const token = localStorage.getItem('aether_access_token')
    const { data } = await apiClient.post('/api/v1/dashboard',params,{
        headers: {
            "Authorization": `Bearer ${token}`
        },
    })
    return data
}
