import axios from "axios";
import { toast } from "sonner";

export function getApiClient() {
  const baseUrl = localStorage.getItem("aether_server_url")?.trim();
  if (!baseUrl) {
    throw new Error("Missing aether_server_url in localStorage");
  }

  const instance = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request Interceptor
  instance.interceptors.request.use((config: any) => {
    const accessToken = localStorage.getItem("aether_access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Response Interceptor for Refresh Token
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("aether_refresh_token");

          const formData = new URLSearchParams();
          formData.append("refresh_token", refreshToken || "");

          const refreshResponse = await axios.post(
            `${baseUrl}/api/v1/auth/refresh-tokens`,
            formData
          );

          const newAccessToken = refreshResponse.data.access_token;

          localStorage.setItem("aether_access_token", newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
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

  return instance;
}
