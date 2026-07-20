import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers, parseEther } from "ethers";
import Loader from "../components/Loader";
import Toast, { useToast } from "../components/Toast";

export default function Withdrawal() {
    const { contract, connected, address, refreshBalances } = useWallet();
    const [activeTab, setActiveTab] = useState("income");
    const [incomeAmount, setIncomeAmount] = useState("");
    const [rewardAmount, setRewardAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const { toasts, toast } = useToast();
    const [summary, setSummary] = useState({
        maturity: "0",
        Withdrawalable: "0",
        reward: "0",
        rewardWithdrawalable: "0"
    });

    useEffect(() => {
        if (connected && contract && address) loadSummary();
    }, [connected, contract, address]);

    async function loadSummary() {
        const data = await contract.getIncomeSummary(address);
        setSummary({
            maturity:           Number(ethers.formatEther(data.maturity)).toFixed(4),
            Withdrawalable:       Number(ethers.formatEther(data.Withdrawalable)).toFixed(4),
            reward:             Number(ethers.formatEther(data.reward)).toFixed(4),
            rewardWithdrawalable: Number(ethers.formatEther(data.rewardWithdrawalable)).toFixed(4),
        });
    }

    async function WithdrawalIncome() {
        try {
            if (!connected) return toast.warn("Please connect your wallet first.");
            if (!incomeAmount) return toast.warn("Please enter an amount.");
            setLoading(true);
            const tx = await contract.WithdrawalSelf(parseEther(incomeAmount));
            await tx.wait();
            await refreshBalances();
            await loadSummary();
            toast.success("Income Withdrawalalal Successful! 💸");
            setIncomeAmount("");
        } catch (err) {
            console.log(err);
            toast.error(err.reason || err.shortMessage || err.message);
        }
        setLoading(false);
    }

    async function WithdrawalReward() {
        try {
            if (!connected) return toast.warn("Please connect your wallet first.");
            if (!rewardAmount) return toast.warn("Please enter an amount.");
            setLoading(true);
            const tx = await contract.WithdrawalRewardSelf(parseEther(rewardAmount));
            await tx.wait();
            await refreshBalances();
            await loadSummary();
            toast.success("Reward Withdrawalal Successful! 🎁");
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
                        <p className="tx-popup-msg">Please connect your wallet to Withdrawal funds.</p>
                        <div className="tx-popup-pulse" />
                    </div>
                </div>
            </>
        );

    return (
        <div className="container-fluid">
            <Toast toasts={toasts} />
            <h2 className="mb-4">Withdrawal</h2>

            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card border-success shadow">
                        <div className="card-body text-center">
                            <h5>Available Income Balance</h5>
                            <h3 className="text-success">{summary.Withdrawalable} CC-CHIP</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-warning shadow">
                        <div className="card-body text-center">
                            <h5>Available Reward Balance</h5>
                            <h3 className="text-warning">{summary.rewardWithdrawalable} CC-CHIP</h3>
                        </div>
                    </div>
                </div>
            </div>

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "income" ? "active" : ""}`} onClick={() => setActiveTab("income")}>
                        Income Withdrawal
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "reward" ? "active" : ""}`} onClick={() => setActiveTab("reward")}>
                        Reward Withdrawal
                    </button>
                </li>
            </ul>

            {activeTab === "income" && (
                <div className="card shadow">
                    <div className="card-header bg-primary text-white">Income Withdrawal</div>
                    <div className="card-body">
                        <label>Amount</label>
                        <input className="form-control mb-3" type="number" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} />
                        {loading && <Loader fullScreen={false} text="Processing transaction..." />}
                        {!loading && (
                            <button className="btn btn-success w-100" disabled={loading} onClick={WithdrawalIncome}>
                                Withdrawal Income
                            </button>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "reward" && (
                <div className="card shadow">
                    <div className="card-header bg-warning text-dark">Reward Withdrawal</div>
                    <div className="card-body">
                        <label>Amount</label>
                        <input className="form-control mb-3" type="number" value={rewardAmount} onChange={(e) => setRewardAmount(e.target.value)} />
                        {loading && <Loader fullScreen={false} text="Processing transaction..." />}
                        {!loading && (
                            <button className="btn btn-danger w-100" disabled={loading} onClick={WithdrawalReward}>
                                Withdrawal Reward
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
