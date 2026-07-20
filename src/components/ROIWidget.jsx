import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function ROIWidget({ contract, userAddress }) {
    const [roi, setRoi] = useState({ dailyROI: 0, pending: 0, daysPassed: 0, totalROI: 0 });
    const [livePending, setLivePending] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [loading, setLoading] = useState(true);

    async function loadROI() {
        try {
            setLoading(true);
            const member = await contract.getMemberData(userAddress);
            const remainingPayout = Number(ethers.formatUnits(member[9], 18));
            const totalROI = Number(ethers.formatUnits(member[4], 18));
            setRemaining(remainingPayout);

            const roiData = await contract.calculateDepositROI(userAddress);
            const dailyROI  = Number(ethers.formatUnits(roiData[0], 18));
            const pending   = Number(ethers.formatUnits(roiData[1], 18));
            const daysPassed = Number(roiData[2]);

            setRoi({ dailyROI, pending, daysPassed, totalROI });
            setLivePending(pending);
        } catch (err) {
            console.log("ROI Error:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!contract || !userAddress) return;
        loadROI();
        const sync = setInterval(loadROI, 60000);
        return () => clearInterval(sync);
    }, [contract, userAddress]);

    // Live per-second tick
    useEffect(() => {
        if (roi.dailyROI <= 0 || remaining <= 0) return;
        const timer = setInterval(() => {
            setLivePending(prev => {
                const next = prev + roi.dailyROI / 86400;
                return next > remaining ? remaining : next;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [roi.dailyROI, remaining]);

    const pct = remaining > 0 ? Math.min(100, (roi.totalROI / (roi.totalROI + remaining)) * 100) : 0;

    return (
        <div className="db-widget db-widget-roi">
            <div className="db-widget-header">
                <span className="db-widget-icon">⚡</span>
                <span className="db-widget-title">Available Daily Reward</span>
                {!loading && roi.dailyROI > 0 && (
                    <span className="db-widget-live-badge">● LIVE</span>
                )}
            </div>

            <div className="db-widget-body">
                {loading ? (
                    <div className="db-widget-spinner" />
                ) : (
                    <>
                        <div className="db-widget-main-val db-widget-ticker">
                            {livePending.toFixed(8)}
                            <span className="db-widget-main-unit">CC-CHIP</span>
                        </div>
                        <div className="db-widget-divider" />
                        <div className="db-widget-rows">
                            <div className="db-widget-row">
                                <span className="db-widget-row-label">Daily Reward</span>
                                <span className="db-widget-row-val db-widget-val-cyan">{roi.dailyROI.toFixed(4)} CC-CHIP</span>
                            </div>
                            <div className="db-widget-row">
                                <span className="db-widget-row-label">Total Received</span>
                                <span className="db-widget-row-val db-widget-val-green">{roi.totalROI.toFixed(4)} CC-CHIP</span>
                            </div>
                            <div className="db-widget-row">
                                <span className="db-widget-row-label">Remaining</span>
                                <span className="db-widget-row-val db-widget-val-gold">{remaining.toFixed(4)} CC-CHIP</span>
                            </div>
                            <div className="db-widget-row">
                                <span className="db-widget-row-label">Days Active</span>
                                <span className="db-widget-row-val">{roi.daysPassed} days</span>
                            </div>
                        </div>
                        <div className="db-widget-progress-wrap">
                            <div className="db-widget-progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="db-widget-progress-label">
                            {pct.toFixed(1)}% of payout used
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
