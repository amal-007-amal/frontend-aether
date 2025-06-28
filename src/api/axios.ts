import axios from "axios";
import { toast } from "sonner";

const baseUrlFromStorage = localStorage.getItem("aether_server_url")?.trim();
console.log(baseUrlFromStorage);

export const apiClient = axios.create({
  baseURL: String(baseUrlFromStorage),
  headers: {
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.request.use((config:any) => {
  const accessToken = localStorage.getItem("aether_access_token");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("aether_refresh_token");

        const refreshResponse = await axios.post(
          `${baseUrlFromStorage}/api/v1/auth/refresh-tokens`,
          { refresh_token: refreshToken }
        );

        const newAccessToken = refreshResponse.data.access_token;

        localStorage.setItem("access_token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        toast.error("Session expired. Please log in again.");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
