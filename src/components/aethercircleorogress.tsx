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
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const progress = Math.min(value / max, 1); // Clamp to 1
    const strokeDashoffset = circumference - progress * circumference;

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
                    stroke={"#D946EF"}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            {/* Center value */}
            <div className="absolute top-[30%] text-sm font-semibold text-gray-800">
                {value}
            </div>
            {/* Label */}
            <p className="text-xs text-gray-500 mt-2 text-center">{label}</p>
        </div>
    );
};
