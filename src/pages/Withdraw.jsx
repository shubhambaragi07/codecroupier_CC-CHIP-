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
            toast.success("Income Withdrawal Successful! 💸");
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
        <div className="db-page">
            <Toast toasts={toasts} />

            {/* ── Page Title ── */}
            <div className="cc-section-title">
                <h1>Withdrawal</h1>
                <p>Withdraw your rewards</p>
            </div>

            {/* ── Balance Cards Row ── */}
            <div className="cc-grid-4">
                {/* Income Balance */}
                <div className="cc-card cc-glow-red" style={{ animation: "db-card-in 0.35s ease both" }}>
                    <div className="cc-withdraw-balance-row">
                        <div className="cc-withdraw-icon" style={{ color: "var(--cc-jackpot)", background: "linear-gradient(135deg, rgba(0,197,126,0.15), rgba(0,232,255,0.08))" }}>
                            💰
                        </div>
                        <div>
                            <h5 style={{ fontSize: "13px", color: "var(--cc-silver-border)", margin: 0 }}>Available Reward Balance</h5>
                            <div className="cc-withdraw-balance" style={{ color: "var(--cc-jackpot)" }}>{summary.Withdrawalable} CC-CHIP</div>
                        </div>
                    </div>
                </div>

                {/* Reward Balance */}
                <div className="cc-card cc-glow-purple" style={{ animation: "db-card-in 0.35s ease both 0.1s" }}>
                    <div className="cc-withdraw-balance-row">
                        <div className="cc-withdraw-icon" style={{ color: "var(--cc-gold-light)", background: "linear-gradient(135deg, rgba(245,166,35,0.15), rgba(255,184,48,0.08))" }}>
                            🎁
                        </div>
                        <div>
                            <h5 style={{ fontSize: "13px", color: "var(--cc-silver-border)", margin: 0 }}>Available Team Reward Balance</h5>
                            <div className="cc-withdraw-balance" style={{ color: "var(--cc-gold-light)" }}>{summary.rewardWithdrawalable} CC-CHIP</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── Tabs ── */}
            <div className="tx-tab-bar">
                <button
                    className={`tx-tab-btn ${activeTab === "income" ? "tx-tab-btn-active" : ""}`}
                    onClick={() => setActiveTab("income")}
                >
                    <span className="tx-tab-icon">💸</span>
                    <span className="tx-tab-label">Reward Withdrawal</span>
                </button>
                <button
                    className={`tx-tab-btn ${activeTab === "reward" ? "tx-tab-btn-active" : ""}`}
                    onClick={() => setActiveTab("reward")}
                >
                    <span className="tx-tab-icon">🎁</span>
                    <span className="tx-tab-label">Team Reward Withdrawal</span>
                </button>
            </div>

            {/* ── Income Withdrawal Form ── */}
            {activeTab === "income" && (
                <div className="cc-card cc-withdraw-form-card">
                    <h3 className="cc-card-title" style={{ margin: 0 }}>Reward Withdrawal</h3>
                    <div className="cc-withdraw-divider" />

                    <div className="cc-withdraw-field-wrap">
                        <label>Amount</label>
                        <div className="cc-withdraw-input-row">
                            <input
                                className="cc-withdraw-input"
                                type="number"
                                placeholder="0.00"
                                value={incomeAmount}
                                onChange={(e) => setIncomeAmount(e.target.value)}
                            />
                            <button
                                className="cc-withdraw-max"
                                onClick={() => setIncomeAmount(summary.Withdrawalable)}
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    {loading && <Loader fullScreen={false} text="Processing transaction..." />}
                    {!loading && (
                        <button
                            className="cc-btn-primary cc-btn-full"
                            disabled={loading}
                            onClick={WithdrawalIncome}
                        >
                            💸 Withdraw Reward
                        </button>
                    )}
                </div>
            )}

            {/* ── Team Reward Withdrawal Form ── */}
            {activeTab === "reward" && (
                <div className="cc-card cc-withdraw-form-card">
                    <h3 className="cc-card-title" style={{ margin: 0 }}>Team Reward Withdrawal</h3>
                    <div className="cc-withdraw-divider" />

                    <div className="cc-withdraw-field-wrap">
                        <label>Amount</label>
                        <div className="cc-withdraw-input-row">
                            <input
                                className="cc-withdraw-input"
                                type="number"
                                placeholder="0.00"
                                value={rewardAmount}
                                onChange={(e) => setRewardAmount(e.target.value)}
                            />
                            <button
                                className="cc-withdraw-max"
                                onClick={() => setRewardAmount(summary.rewardWithdrawalable)}
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    {loading && <Loader fullScreen={false} text="Processing transaction..." />}
                    {!loading && (
                        <button
                            className="cc-btn-primary cc-btn-full"
                            disabled={loading}
                            onClick={WithdrawalReward}
                        >
                            🎁 Withdraw Team Reward
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

