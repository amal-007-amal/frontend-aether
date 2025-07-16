import { useCallback } from "react";
import { getDeviceStatus } from "../api/login";
import { toast } from "sonner";
import { toZonedTime, format } from "date-fns-tz";

export function useDeviceStatus() {
  const fetchDeviceStatus = useCallback(async (deviceid: any) => {
    try {
        const data = await getDeviceStatus(deviceid);
      const parsedPayload = JSON.parse(data.payload);
      const rawDate = new Date(data.created_at);
      const timeZone = "Asia/Kolkata";
      const zonedDate = toZonedTime(rawDate, timeZone);
      const formattedDate = format(zonedDate, "MMMM d, yyyy, h:mm a '(GMT+5:30)'");
      console.log(parsedPayload)
      return {
        ...parsedPayload,
        created_at: formattedDate,
      };
    } catch (err) {
      toast.error("Unable to connect with server!");
      return null;
    }
  }, []);

  return { fetchDeviceStatus };
}