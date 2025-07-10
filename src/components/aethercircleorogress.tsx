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

    const darkTheme = localStorage.getItem("aether_theme") === "dark";

    // Colors for "Abandoned Numbers"
    const lightModeStroke = "#F5D0FE"; // light purple
    const lightModeFill = "#d396dc";   // dark purple
    const darkModeColor = "#3a332e";   // dark fill/stroke

    const strokeColor =
        label === "Abandoned Numbers"
            ? darkTheme ? darkModeColor : lightModeStroke
            : "#D946EF";

    const fillColor =
        label === "Abandoned Numbers"
            ? darkTheme ? darkModeColor : lightModeFill
            : "transparent";

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
                    stroke={strokeColor}
                    fill={fillColor}
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
            <div className={`absolute top-[30%] text-sm font-semibold text-gray-800 dark:text-white`}>
                {value}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center dark:text-white">
                {label}
            </p>
        </div>
    );
};
