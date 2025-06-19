import type { UserLoginResponse } from "../types/login"
import { apiClient } from "./axios"

export const getServerUrl = async (): Promise<true> => {
    const { data } = await apiClient.get('/api/v1/ping')
    return data
}


export const postLogin = async (payload: any): Promise<UserLoginResponse> => {
    const { data } = await apiClient.post('/api/v1/auth/login', payload, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }}
    )
    return data
}


export const postSetPasswordLogin = async (payload: any): Promise<UserLoginResponse> => {
    const { data } = await apiClient.post('/api/v1/auth/password', payload, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }}
    )
    return data
}
