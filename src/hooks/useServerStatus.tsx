import { useEffect, useRef } from "react";

type OnMessageHandler = (data: any) => void;

export function useServerSocket(token: string, onMessage: OnMessageHandler) {
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!token) {
      console.warn("No token provided to WebSocket hook");
      return;
    }

    console.log("Connecting to WebSocket with token:", token);

    const ws = new WebSocket(
      `wss://fastapiserver-0owu.onrender.com/api/v1/server/ws/stats?token=${token}`
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        onMessageRef.current(data);
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.warn("WebSocket disconnected");
    };

    return () => {
      ws.close();
      console.log("🔌 WebSocket closed");
    };
  }, [token]);
}
