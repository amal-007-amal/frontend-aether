import React from "react";

interface CircleProgressProps {
  value: number;
  max: number;
  label: string;
}

export const CircleProgress: React.FC<CircleProgressProps> = ({
  value,
  max,
  label,
}) => {
  const radius = 40;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference - progress * circumference;

  // Read theme from localStorage
  const theme = localStorage.getItem("aether_theme");
  const darkTheme = theme === "dark";

  // Final stroke/fill color decision based on label and theme
  const { strokeColor, fillColor } = React.useMemo(() => {
    if (label === "Abandoned Numbers") {
      return darkTheme
        ? {
            strokeColor: "#3a332e",   // dark brown for dark mode
            fillColor: "#3a332e",
          }
        : {
            strokeColor: "#F5D0FE",   // light purple stroke
            fillColor: "#d396dc",     // lighter purple fill
          };
    }

    return {
      strokeColor: "#D946EF", // default stroke
      fillColor: "transparent", // default fill
    };
  }, [label, darkTheme]);

  // Safety fallback (optional but recommended)
  const safeStroke = strokeColor || "#cccccc";
  const safeFill = fillColor || "transparent";

  return (
    <div className="flex flex-col items-center relative">
      <svg height={radius * 2} width={radius * 2}>
        {/* Background ring */}
        <circle
          stroke="#F5D0FE"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress ring */}
        <circle
          stroke={safeStroke}
          fill={safeFill}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      <div className="absolute top-[30%] text-sm font-semibold text-gray-800 dark:text-white">
        {value}
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center dark:text-white">
        {label}
      </p>
    </div>
  );
};
