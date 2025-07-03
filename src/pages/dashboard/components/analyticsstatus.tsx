import { CheckCircle, AlertCircle, Loader, XCircle } from "lucide-react";

const statusCards = [
  {
    label: "Total Users",
    icon: <CheckCircle className="w-6 h-6 text-green-400" />,
    lablelColor: "text-green-400",
    cardCount: 50
  },
  {
    label: "Call Processing",
    icon: <Loader className="w-6 h-6  animate-spin text-blue-400" />,
    lablelColor: "text-blue-400",
    cardCount: 15
  },
  {
    label: "Call Warning",
    icon: <AlertCircle className="w-6 h-6 text-yellow-400" />,
    lablelColor: "text-yellow-400",
    cardCount: 80
  },
  {
    label: "Call Error",
    icon: <XCircle className="w-6 h-6 text-red-400" />,
    lablelColor: "text-red-400",
    cardCount: 3
  },
];

export default function AnalyticsStatus() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
      {statusCards.map((card, index) => (
        <div
          key={index}
          className={`p-5 rounded-xl border border-gray-200 text-white flex flex-col justify-between gap-4`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-800 text-2xl text-left font-bold">{card.cardCount}</h3>
              <div className={`text-sm font-medium text-gray-600`}>{card.label}</div>
            </div>
            <div className={`p-3 bg-white bg-opacity-50 rounded-full`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
