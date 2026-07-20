import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers, parseEther } from "ethers";
import Loader from "../components/Loader";
import Toast, { useToast } from "../components/Toast";

export default function Withdraw() {
    const { contract, connected, address, refreshBalances } = useWallet();
    const [activeTab, setActiveTab] = useState("income");
    const [incomeAmount, setIncomeAmount] = useState("");
    const [rewardAmount, setRewardAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const { toasts, toast } = useToast();
    const [summary, setSummary] = useState({
        maturity: "0",
        withdrawable: "0",
        reward: "0",
        rewardWithdrawable: "0"
    });

    useEffect(() => {
        if (connected && contract && address) loadSummary();
    }, [connected, contract, address]);

    async function loadSummary() {
        const data = await contract.getIncomeSummary(address);
        setSummary({
            maturity:           Number(ethers.formatEther(data.maturity)).toFixed(4),
            withdrawable:       Number(ethers.formatEther(data.withdrawable)).toFixed(4),
            reward:             Number(ethers.formatEther(data.reward)).toFixed(4),
            rewardWithdrawable: Number(ethers.formatEther(data.rewardWithdrawable)).toFixed(4),
        });
    }

    async function withdrawIncome() {
        try {
            if (!connected) return toast.warn("Please connect your wallet first.");
            if (!incomeAmount) return toast.warn("Please enter an amount.");
            setLoading(true);
            const tx = await contract.withdrawSelf(parseEther(incomeAmount));
            await tx.wait();
            await refreshBalances();
            await loadSummary();
            toast.success("Income Withdrawal Successful! 💸");
            setIncomeAmount("");
        } catch (err) {
            console.log(err);
            toast.error(err.reason || err.shortMessage || err.message);
        }
        setLoading(false);
    }

    async function withdrawReward() {
        try {
            if (!connected) return toast.warn("Please connect your wallet first.");
            if (!rewardAmount) return toast.warn("Please enter an amount.");
            setLoading(true);
            const tx = await contract.withdrawRewardSelf(parseEther(rewardAmount));
            await tx.wait();
            await refreshBalances();
            await loadSummary();
            toast.success("Reward Withdrawal Successful! 🎁");
            setRewardAmount("");
        } catch (err) {
            console.log(err);
            toast.error(err.reason || err.shortMessage || err.message);
        }
        setLoading(false);
    }

    if (!connected)
        return (
            <>
                <Toast toasts={toasts} />
                <div className="tx-popup-overlay">
                    <div className="tx-popup">
                        <div className="tx-popup-icon">🔌</div>
                        <h3 className="tx-popup-title">Wallet Not Connected</h3>
                        <p className="tx-popup-msg">Please connect your wallet to withdraw funds.</p>
                        <div className="tx-popup-pulse" />
                    </div>
                </div>
            </>
        );

    return (
        <div className="container-fluid">
            <Toast toasts={toasts} />
            <h2 className="mb-4">Withdraw</h2>

            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card border-success shadow">
                        <div className="card-body text-center">
                            <h5>Available Income Balance</h5>
                            <h3 className="text-success">{summary.withdrawable} CC-CHIP</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-warning shadow">
                        <div className="card-body text-center">
                            <h5>Available Reward Balance</h5>
                            <h3 className="text-warning">{summary.rewardWithdrawable} CC-CHIP</h3>
                        </div>
                    </div>
                </div>
            </div>

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "income" ? "active" : ""}`} onClick={() => setActiveTab("income")}>
                        Income Withdraw
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "reward" ? "active" : ""}`} onClick={() => setActiveTab("reward")}>
                        Reward Withdraw
                    </button>
                </li>
            </ul>

            {activeTab === "income" && (
                <div className="card shadow">
                    <div className="card-header bg-primary text-white">Income Withdraw</div>
                    <div className="card-body">
                        <label>Amount</label>
                        <input className="form-control mb-3" type="number" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} />
                        {loading && <Loader fullScreen={false} text="Processing transaction..." />}
                        {!loading && (
                            <button className="btn btn-success w-100" disabled={loading} onClick={withdrawIncome}>
                                Withdraw Income
                            </button>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "reward" && (
                <div className="card shadow">
                    <div className="card-header bg-warning text-dark">Reward Withdraw</div>
                    <div className="card-body">
                        <label>Amount</label>
                        <input className="form-control mb-3" type="number" value={rewardAmount} onChange={(e) => setRewardAmount(e.target.value)} />
                        {loading && <Loader fullScreen={false} text="Processing transaction..." />}
                        {!loading && (
                            <button className="btn btn-danger w-100" disabled={loading} onClick={withdrawReward}>
                                Withdraw Reward
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
