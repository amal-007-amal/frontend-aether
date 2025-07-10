import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RedirectRoot() {
  const navigate = useNavigate();

  useEffect(() => {
    const serverUrl = localStorage.getItem("aether_server_url");
    const token = localStorage.getItem("aether_access_token");

    if (!serverUrl) {
      navigate("/onboard");
    } else if (!token) {
      navigate("/onboard");
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  return <div className="p-4 text-gray-500">Checking status...</div>;
}
