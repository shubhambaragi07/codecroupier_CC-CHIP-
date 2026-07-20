import { useState, useEffect } from "react";
import { parseEther } from "ethers";
import { useWallet } from "../context/WalletContext";
import { CONTRACT_ADDRESS } from "../config/contract";
import { useSearchParams } from "react-router-dom";
import { MaxUint256 } from "ethers";
import Loader from "../components/Loader";
import Toast, { useToast } from "../components/Toast";

export default function Deposit() {
    const { token, contract, connected, address, refreshBalances } = useWallet();
    const [amount, setAmount] = useState("");
    const [referrer, setReferrer] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const { toasts, toast } = useToast();

    useEffect(() => {
        if (!connected || !contract || !address) return;
        loadReferrer();
    }, [connected, contract, address]);

    async function loadReferrer() {
        try {
            const user = await contract.users(address);
            if (user.exists && user.referrer !== "0x0000000000000000000000000000000000000000") {
                setReferrer(user.referrer);
                return;
            }
            const ref = searchParams.get("ref");
            if (ref) setReferrer(ref);
        } catch (err) {
            console.log(err);
        }
    }

    const submitDeposit = async () => {
        try {
            if (!connected) return toast.warn("Please connect your wallet first.");
            if (!amount) return toast.warn("Please enter a deposit amount.");
            if (Number(amount) % 100 !== 0) return toast.warn("Deposit amount must be a multiple of 100.");

            setLoading(true);
            const depositAmount = parseEther(amount);
            const user = await contract.users(address);
            let finalReferrer;

            if (user.exists && user.referrer !== "0x0000000000000000000000000000000000000000") {
                finalReferrer = user.referrer;
            } else {
                finalReferrer = referrer.trim();
                if (finalReferrer === "") finalReferrer = await contract.companyWallet();
            }

            const allowance = await token.allowance(address, CONTRACT_ADDRESS);
            if (allowance < depositAmount) {
                const approveTx = await token.approve(CONTRACT_ADDRESS, MaxUint256);
                await approveTx.wait(1);
            }

            const depositTx = await contract.deposit(depositAmount, finalReferrer);
            await depositTx.wait();
            await refreshBalances();

            toast.success("Deposit Successful! 🎉");
            setAmount("");

            const updatedUser = await contract.users(address);
            if (updatedUser.exists) setReferrer(updatedUser.referrer);
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
                        <p className="tx-popup-msg">Please connect your wallet to make a deposit.</p>
                        <div className="tx-popup-pulse" />
                    </div>
                </div>
            </>
        );

    return (
        <div className="container">
            <Toast toasts={toasts} />
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">Deposit CC-CHIP</h4>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label>Deposit Amount</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="100"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <small className="text-muted">Minimum Multiple of 100</small>
                            </div>
                            <div className="mb-3">
                                <label>Referrer Address</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="0x..."
                                    value={referrer}
                                    onChange={(e) => setReferrer(e.target.value)}
                                    disabled={connected && referrer !== ""}
                                />
                            </div>
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-success w-100"
                                    onClick={submitDeposit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                            <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", display: "inline-block", animation: "cc-spin 0.7s linear infinite" }} />
                                            Processing...
                                        </span>
                                    ) : "Submit Deposit"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
