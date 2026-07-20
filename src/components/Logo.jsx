import React from "react";

export default function Logo() {
  return (
    <div className="cc-logo">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" stroke="url(#rimGrad)" strokeWidth="2" />
        <circle cx="16" cy="16" r="10.5" fill="#0A0A0A" stroke="#7A7A7A" strokeWidth="1" />
        <text
          x="16"
          y="20.5"
          textAnchor="middle"
          fontFamily="Montserrat, sans-serif"
          fontWeight="800"
          fontSize="11"
          fill="#E0E0E0"
        >
          C
        </text>
        <defs>
          <linearGradient id="rimGrad" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="#D72638" />
            <stop offset="100%" stopColor="#9A00FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="cc-logo-text">
        <span className="cc-logo-title">CodeCroupier</span>
        <span className="cc-logo-sub">The Dealer is Code</span>
      </div>
    </div>
  );
}
