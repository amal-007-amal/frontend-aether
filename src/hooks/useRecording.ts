import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getRecording } from "../api/call";

export function useRecording() {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [recordingMap, setRecordingMap] = useState<Record<string, string>>({});

  const fetchRecording = useCallback(async (id: string) => {
    setLoadingMap({ [id]: true });
    setRecordingMap({});

    try {
      const record = await getRecording(id);
      setRecordingMap({ [id]: record.download_url });
    } catch (err) {
      toast.error("Unable to connect with server!");
    } finally {
      setLoadingMap({ [id]: false });
    }
  }, []);

  return {
    fetchRecording,
    recordingMap,
    loadingMap
  };
}
