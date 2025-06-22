import React from "react";

export default function CircleProgress({ percent = 0, size = 80, stroke = 7, className = "", ...rest }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - percent / 100);
  // className תמיד יכיל circle-progress-main כברירת מחדל
  const combinedClass = `circle-progress-main ${className}`.trim();
  return (
    <div className={combinedClass} style={{ display: "inline-block", direction: "rtl" }} {...rest}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e0e0e0"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s" }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.28}
          fontWeight="bold"
          className="circle-progress-text"
        >
          {Math.round(percent)}%
        </text>
      </svg>
    </div>
  );
} 