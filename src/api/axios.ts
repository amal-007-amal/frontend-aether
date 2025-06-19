import axios from "axios"

const baseUrlFromStorage = localStorage.getItem("aether_server_url") || "/api";

export const apiClient = axios.create({
  baseURL: baseUrlFromStorage,
  headers: {
    "Content-Type": "application/json",
  },
})