import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import Loader from "../components/Loader";
import Toast, { useToast } from "../components/Toast";

export default function ClaimROI() {
    const { contract, connected, refreshBalances } = useWallet();
    const [loading, setLoading] = useState(false);
    const { toasts, toast } = useToast();

    const claimROI = async () => {
        try {
            if (!connected) return toast.warn("Please connect your wallet first.");
            setLoading(true);
            const tx = await contract.claimROI();
            await tx.wait();
            await refreshBalances();
            toast.success("ROI Claimed Successfully!");
        } catch (err) {
            console.log(err);
            toast.error(err.reason || err.shortMessage || "Transaction Failed");
        } finally {
            setLoading(false);
        }
    };

    if (!connected)
        return (
            <>
                <Toast toasts={toasts} />
                <div className="tx-popup-overlay">
                    <div className="tx-popup">
                        <div className="tx-popup-icon">🔌</div>
                        <h3 className="tx-popup-title">Wallet Not Connected</h3>
                        <p className="tx-popup-msg">Please connect your wallet to claim ROI.</p>
                        <div className="tx-popup-pulse" />
                    </div>
                </div>
            </>
        );

    return (
        <div className="container">
            <Toast toasts={toasts} />
            <div className="row justify-content-center">
                <div className="col-lg-5">
                    <div className="card shadow">
                        <div className="card-header bg-success text-white">
                            <h4 className="mb-0">Claim ROI</h4>
                        </div>
                        <div className="card-body text-center">
                            <i className="fas fa-coins fa-4x text-success mb-4"></i>
                            <h5>Claim your Daily ROI</h5>
                            {loading && <Loader fullScreen={false} text="Claiming ROI..." />}
                            {!loading && (
                                <button
                                    className="btn btn-success btn-lg mt-3"
                                    disabled={loading}
                                    onClick={claimROI}
                                >
                                    Claim ROI
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
