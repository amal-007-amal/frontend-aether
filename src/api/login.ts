import type { CreateUser, User, UserLoginResponse } from "../types/login"
import axios from "axios";
import { getApiClient } from "./axios";

export const getAccessToken = async (): Promise<string | null> => {
    try {  
        const client = axios.create({
            baseURL: String(localStorage.getItem("aether_server_url")),
            headers: { "Content-Type": "application/json" },
        });

        const res = await client.get("/api/v1/auth/refresh-tokens");
        return res?.data?.access_token || null;
     }catch (error) {
        console.error("Error fetching access token:", error);
        return null;
    }
}

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
    const apiClient = getApiClient();
    const baseUrlFromStorage = localStorage.getItem("aether_server_url")?.trim();
    console.log("server url before login",baseUrlFromStorage)
    const { data } = await apiClient.post('/api/v1/auth/login', payload, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    }
    )
    return data
}


export const postSetPasswordLogin = async (payload: any): Promise<UserLoginResponse> => {
    const apiClient = getApiClient();
    const { data } = await apiClient.post('/api/v1/auth/password', payload, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    }
    )
    return data
}


export const getUsers = async (): Promise<User[]> => {
    const apiClient = getApiClient();
    const token = localStorage.getItem('aether_access_token')
    const { data } = await apiClient.get('/api/v1/users', {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    console.log("users data", data)
    return data.users
}

export const createUser = async (payload: CreateUser): Promise<CreateUser> => {
    const apiClient = getApiClient();
    const token = localStorage.getItem('aether_access_token')
    const { data } = await apiClient.post('/api/v1/users', payload, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }
    )
    return data
}

export const updateUser = async (payload: any): Promise<any> => {
    const apiClient = getApiClient();
    const token = localStorage.getItem('aether_access_token')
    const { data } = await apiClient.put('/api/v1/users', payload, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }
    )
    return data
}


export const deleteUser = async (userid: any): Promise<any> => {
    const apiClient = getApiClient();
    const token = localStorage.getItem('aether_access_token')
    const { data } = await apiClient.delete(`/api/v1/users?user_id=${userid}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }
    )
    return data
}


