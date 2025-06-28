import { LoaderCircle } from "lucide-react";

export default function AetherLoader() {
    return (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
            <LoaderCircle className="animate-spin w-6 h-6 text-purple-500" />
        </div>
    )
}