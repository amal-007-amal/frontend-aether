import type { CallLogDetails } from "../types/call"
import { apiClient } from "./axios"

export const getCalls = async (params:any): Promise<CallLogDetails[]> => {
    const token = localStorage.getItem('aether_access_token')
    const { data } = await apiClient.get('/api/v1/calls', {
        headers: {
            "Authorization": `Bearer ${token}`
        },
        params:params
    })
    return data.calls
}
