import { useState } from "react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [hover, setHover] = useState(false);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  if (isConnected && address) {
    return (
      <button
        className="cc-wallet-btn-connected"
        onClick={() => open({ view: "Account" })}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title={address}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: hover
            ? "rgba(255, 46, 85, 0.15)"
            : "rgba(0, 232, 255, 0.08)",
          border: hover
            ? "1px solid rgba(255, 46, 85, 0.5)"
            : "1px solid rgba(0, 232, 255, 0.25)",
          borderRadius: "10px",
          padding: "7px 14px",
          fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
          fontSize: "12px",
          color: hover ? "#FF2E55" : "#00E8FF",
          cursor: "pointer",
          transition: "all 0.15s ease",
          boxShadow: hover
            ? "0 0 14px rgba(255, 46, 85, 0.2)"
            : "none",
          outline: "none",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "#00C57E",
            boxShadow: "0 0 6px #00C57E",
            flexShrink: 0,
          }}
        />
        {shortAddress}
      </button>
    );
  }

  return (
    <button
      className="cc-wallet-btn-connect"
      onClick={() => open()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: hover
          ? "linear-gradient(135deg, #FF2E55, #D72638)"
          : "linear-gradient(135deg, #D72638, #8C1620)",
        border: "none",
        borderRadius: "10px",
        padding: "10px 18px",
        fontWeight: 600,
        fontSize: "13px",
        fontFamily: '"Inter", sans-serif',
        color: "#fff",
        cursor: "pointer",
        transition: "box-shadow 0.2s ease, transform 0.15s ease",
        boxShadow: hover
          ? "0 0 20px rgba(255, 46, 85, 0.4)"
          : "0 0 0 rgba(255, 46, 85, 0)",
        transform: hover ? "translateY(-1px)" : "translateY(0)",
        outline: "none",
        whiteSpace: "nowrap",
        letterSpacing: "0.3px",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="6" width="22" height="12" rx="2" ry="2" />
        <circle cx="12" cy="12" r="2" />
      </svg>
      Connect Wallet
    </button>
  );
}

