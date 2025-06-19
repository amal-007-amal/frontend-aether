import axios from "axios"

const baseUrlFromStorage = localStorage.getItem("aether_server_url");
console.log(baseUrlFromStorage)

export const apiClient = axios.create({
  baseURL: String(baseUrlFromStorage),
  headers: {
    "Content-Type": "application/json",
  },
})