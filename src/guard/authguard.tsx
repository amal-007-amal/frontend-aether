// components/AuthGuard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AetherAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAllowed, setIsAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const serverUrl = localStorage.getItem("aether_server_url");
    const accessToken = localStorage.getItem("aether_access_token");
    if (!serverUrl) {
      navigate("/");
    } else if (!accessToken) {
      navigate("/onboard");
    } else {
      setIsAllowed(true);
    }
  }, [navigate]);

  if (!isAllowed) {
    return <div className="p-4 text-gray-500">Checking access...</div>;
  }

  return <>{children}</>;
}
