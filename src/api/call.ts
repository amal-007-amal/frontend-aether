import type { CallLogDetails } from "../types/call"
import { apiClient } from "./axios"

export const getCalls = async (): Promise<CallLogDetails[]> => {
    const token = localStorage.getItem('aether_access_token')
    const { data } = await apiClient.get('/api/v1/calls', {
        headers: {
            "Authorization": `Bearer ${token}`
        },
        params: {
            limit: encodeURIComponent(1000), // optional, axios will encode automatically
        },
    })
    return data.calls
}
