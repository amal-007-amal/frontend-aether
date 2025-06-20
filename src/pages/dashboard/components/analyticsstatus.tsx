import { CheckCircle, AlertCircle, Loader, XCircle } from "lucide-react";

const statusCards = [
  {
    label: "Total Users",
    icon: <CheckCircle className="w-6 h-6 text-green-400" />,
    cardborder: "from-green-400 to-green-500",
    lablelColor: "text-green-400"
  },
  {
    label: "Call Processing",
    icon: <Loader className="w-6 h-6  animate-spin text-blue-400" />,
    cardborder: "to-indigo-500 from-blue-600",
    lablelColor: "text-blue-400"
  },
  {
    label: "Call Warning",
    icon: <AlertCircle className="w-6 h-6 text-yellow-400" />,
    cardborder: "to-emarald-500 from-yellow-400",
    lablelColor: "text-yellow-400"
  },
  {
    label: "Call Error",
    icon: <XCircle className="w-6 h-6 text-red-400" />,
    cardborder: "to-emarald-500 from-red-400",
    lablelColor: "text-red-400"
  },
];

export default function AnalyticsStatus() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
      {statusCards.map((card, index) => (
        <div
          key={index}
          className={`p-5 rounded shadow text-white flex flex-col justify-between gap-4`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 bg-white bg-opacity-50 rounded-full border shadow`}>
              {card.icon}
            </div>
            <div className={`text-sm font-medium text-black`}>{card.label}</div>
          </div>
          <div>
            <div className="text-xs opacity-80 text-gray-500 text-right">Status info here</div>
          </div>
        </div>
      ))}
    </div>
  );
}
