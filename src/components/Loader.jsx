import React from "react";

const css = `
@keyframes cc-spin { to { transform: rotate(360deg); } }
@keyframes cc-spin-rev { to { transform: rotate(-360deg); } }
@keyframes cc-pulse { 0%,100%{opacity:.4;transform:scale(.85)} 50%{opacity:1;transform:scale(1)} }
`;

export default function Loader({ text = "Please wait...", fullScreen = true }) {
    const isPage = !fullScreen;

    const wrapper = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
        ...(fullScreen
            ? { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(9,6,7,0.93)", backdropFilter: "blur(6px)" }
            : { position: "fixed", top: "56px", left: 0, right: 0, bottom: 0, zIndex: 500, background: "transparent" }),
    };

    return (
        <div style={wrapper}>
            <style>{css}</style>

            {/* Triple ring spinner */}
            <div style={{ position: "relative", width: 64, height: 64 }}>
                {/* Outer ring */}
                <div style={{
                    position: "absolute", inset: 0,
                    borderRadius: "50%",
                    border: "2.5px solid transparent",
                    borderTopColor: "#ff2e55",
                    borderRightColor: "#ff2e55",
                    animation: "cc-spin 1s linear infinite",
                }} />
                {/* Middle ring */}
                <div style={{
                    position: "absolute", inset: 8,
                    borderRadius: "50%",
                    border: "2.5px solid transparent",
                    borderTopColor: "#9a00ff",
                    borderLeftColor: "#9a00ff",
                    animation: "cc-spin-rev 0.75s linear infinite",
                }} />
                {/* Inner dot */}
                <div style={{
                    position: "absolute", inset: 20,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ff2e55, #9a00ff)",
                    animation: "cc-pulse 1.2s ease-in-out infinite",
                }} />
            </div>

            <p style={{ margin: 0, color: "#a0a0b0", fontSize: "13px", letterSpacing: "0.4px" }}>
                {text}
            </p>
        </div>
    );
}
