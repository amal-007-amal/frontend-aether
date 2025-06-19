import type { UserLoginResponse } from "../types/login"
import { apiClient } from "./axios"
import axios from "axios";

export const getServerUrl = async (customBaseUrl?: string) => {
    try {
        const client = axios.create({
            baseURL: customBaseUrl || String(localStorage.getItem("aether_server_url")),
            headers: { "Content-Type": "application/json" },
        });

        const res = await client.get("/api/v1/ping");
        return res?.data;
    } catch {
        return null;
    }
};

export const postLogin = async (payload: any): Promise<UserLoginResponse> => {
    const { data } = await apiClient.post('/api/v1/auth/login', payload, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    }
    )
    return data
}


export const postSetPasswordLogin = async (payload: any): Promise<UserLoginResponse> => {
    const { data } = await apiClient.post('/api/v1/auth/password', payload, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    }
    )
    return data
}
