import { useState, useCallback } from "react";

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const show = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const toast = {
        success: (msg) => show(msg, "success"),
        error:   (msg) => show(msg, "error"),
        warn:    (msg) => show(msg, "warn"),
    };

    return { toasts, toast };
}

const ICONS = {
    success: "✅",
    error:   "❌",
    warn:    "⚠️",
};

export default function Toast({ toasts }) {
    if (!toasts.length) return null;
    return (
        <div className="cc-toast-stack">
            {toasts.map(t => (
                <div key={t.id} className={`cc-toast cc-toast-${t.type}`}>
                    <span className="cc-toast-icon">{ICONS[t.type]}</span>
                    <span className="cc-toast-msg">{t.message}</span>
                </div>
            ))}
        </div>
    );
}
