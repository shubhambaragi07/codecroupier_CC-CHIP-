import { useEffect, useState } from "react";
import axios from "axios";
import { Token_URL } from "../config/tokenurl";

export default function TokenPrice() {
    const [price, setPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [pulse, setPulse] = useState(false);

    async function fetchPrice() {
        try {
            const res = await axios.get(`${Token_URL}/api/token`);
            setPrice(res.data.price);
            setLastUpdated(new Date());
            setPulse(true);
            setTimeout(() => setPulse(false), 600);
        } catch {
            // silently keep last known price
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPrice();
        const interval = setInterval(fetchPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="db-widget db-widget-price">
            <div className="db-widget-header">
                <span className="db-widget-icon">💲</span>
                <span className="db-widget-title">CC-CHIP Price</span>
                <span className={`db-widget-live-dot ${pulse ? "db-widget-live-pulse" : ""}`} />
            </div>

            <div className="db-widget-body">
                {loading ? (
                    <div className="db-widget-spinner" />
                ) : (
                    <>
                        <div className="db-widget-main-val">
                            $ 1.08
                            <span className="db-widget-main-unit">USD</span>
                        </div>
                        <div className="db-widget-sub">1 CC-CHIP = 1.08 USD</div>
                    </>
                )}
            </div>
            {lastUpdated && (
                <div className="db-widget-footer">
                    Updated {lastUpdated.toLocaleTimeString()}
                </div>
            )}
        </div>
    );
}
