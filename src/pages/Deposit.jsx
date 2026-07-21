import { useState, useEffect } from "react";
import { parseEther, ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import { CONTRACT_ADDRESS } from "../config/contract";
import { useSearchParams } from "react-router-dom";
import { MaxUint256 } from "ethers";
import { ERC20ABI } from "../abi/ERC20ABI";
import Loader from "../components/Loader";
import Toast, { useToast } from "../components/Toast";

export default function Deposit() {
    const { token, contract, connected, address, refreshBalances, provider } = useWallet();
    const [amount, setAmount] = useState("");
    const [referrer, setReferrer] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const { toasts, toast } = useToast();
    const [tokenBalance, setTokenBalance] = useState("0");
    const [bnbBalance, setBnbBalance] = useState("0");

    useEffect(() => {
        if (!connected || !contract || !address) return;
        loadReferrer();
        loadBalances();
    }, [connected, contract, address]);

    async function loadBalances() {
        try {
            const tokenAddress = await contract.token();
            const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
            const tokBal = await tokenContract.balanceOf(address);
            setTokenBalance(ethers.formatEther(tokBal));
            const bnb = await provider.getBalance(address);
            setBnbBalance(ethers.formatEther(bnb));
        } catch (err) {
            console.log(err);
        }
    }

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

    const submitStake = async () => {
        try {
            if (!connected) return toast.warn("Please connect your wallet first.");
            if (!amount) return toast.warn("Please enter a Stake amount.");
            if (Number(amount) % 100 !== 0) return toast.warn("Stake amount must be a multiple of 100.");

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
            await loadBalances();

            toast.success("Stake Successful! 🎉");
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
                        <p className="tx-popup-msg">Please connect your wallet to stake CC-CHIP.</p>
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
                <h1>Stake CC-CHIP</h1>
                <p>Stake your tokens and start earning daily rewards</p>
            </div>

            {/* ── Balance Cards ── */}
            <div className="cc-grid-3">
                <div className="cc-card cc-glow-red">
                    <div className="cc-withdraw-balance-row">
                        <div className="cc-withdraw-icon" style={{ color: "var(--cc-cyan)", background: "linear-gradient(135deg, rgba(0,232,255,0.15), rgba(154,0,255,0.08))" }}>
                            🪙
                        </div>
                        <div>
                            <h5 style={{ fontSize: "13px", color: "var(--cc-silver-border)", margin: 0 }}>CC-CHIP Balance</h5>
                            <div className="cc-withdraw-balance" style={{ color: "var(--cc-cyan)" }}>{Number(tokenBalance).toFixed(2)} CC-CHIP</div>
                        </div>
                    </div>
                </div>

                <div className="cc-card cc-glow-purple">
                    <div className="cc-withdraw-balance-row">
                        <div className="cc-withdraw-icon" style={{ color: "var(--cc-gold-light)", background: "linear-gradient(135deg, rgba(245,166,35,0.15), rgba(255,184,48,0.08))" }}>
                            💎
                        </div>
                        <div>
                            <h5 style={{ fontSize: "13px", color: "var(--cc-silver-border)", margin: 0 }}>BNB Balance</h5>
                            <div className="cc-withdraw-balance" style={{ color: "var(--cc-gold-light)" }}>{Number(bnbBalance).toFixed(4)} BNB</div>
                        </div>
                    </div>
                </div>

                <div className="cc-card" style={{
                    background: "linear-gradient(155deg, rgba(0,197,126,0.10), rgba(255,255,255,0.015) 65%)",
                    borderColor: "rgba(0,197,126,0.3)"
                }}>
                    <div className="cc-withdraw-balance-row">
                        <div className="cc-withdraw-icon" style={{ color: "var(--cc-jackpot)", background: "linear-gradient(135deg, rgba(0,197,126,0.18), rgba(0,197,126,0.04))" }}>
                            📊
                        </div>
                        <div>
                            <h5 style={{ fontSize: "13px", color: "var(--cc-silver-border)", margin: 0 }}>Min. Stake</h5>
                            <div className="cc-withdraw-balance" style={{ color: "var(--cc-jackpot)" }}>100 CC-CHIP</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stake Form ── */}
            <div className="cc-card cc-withdraw-form-card">
                <h3 className="cc-card-title" style={{ margin: 0 }}>Stake Tokens</h3>
                <div className="cc-withdraw-divider" />

                <div className="cc-withdraw-field-wrap">
                    <label>Stake Amount (Multiple of 100)</label>
                    <div className="cc-withdraw-input-row">
                        <input
                            className="cc-withdraw-input"
                            type="number"
                            placeholder="100"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <button
                            className="cc-withdraw-max"
                            onClick={() => setAmount(tokenBalance)}
                        >
                            MAX
                        </button>
                    </div>
                    <small style={{ color: "var(--cc-silver-border)", fontSize: "12px", marginTop: "4px" }}>
                        Minimum stake is 100 CC-CHIP. Amount must be in multiples of 100.
                    </small>
                </div>

                <div className="cc-withdraw-field-wrap">
                    <label>Referrer Address</label>
                    <div className="cc-withdraw-input-row">
                        <input
                            className="cc-withdraw-input"
                            type="text"
                            placeholder="0x..."
                            value={referrer}
                            onChange={(e) => setReferrer(e.target.value)}
                            disabled={connected && referrer !== "" && referrer !== "0x0000000000000000000000000000000000000000"}
                            style={{ fontFamily: "var(--cc-font-mono)", fontSize: "12px" }}
                        />
                    </div>
                    {referrer && referrer !== "0x0000000000000000000000000000000000000000" && (
                        <small style={{ color: "var(--cc-cyan)", fontSize: "11px", marginTop: "4px" }}>
                            ✅ Referrer set: {referrer.substring(0, 6)}...{referrer.substring(38)}
                        </small>
                    )}
                </div>

                <div className="cc-withdraw-divider" />

                {loading && <Loader fullScreen={false} text="Processing stake transaction..." />}
                {!loading && (
                    <button
                        className="cc-btn-primary cc-btn-full"
                        disabled={loading}
                        onClick={submitStake}
                        style={{ padding: "14px 20px", fontSize: "15px" }}
                    >
                        🔥 Stake CC-CHIP
                    </button>
                )}
            </div>

            {/* ── Info Card ── */}
            <div className="cc-card" style={{
                background: "linear-gradient(135deg, rgba(154,0,255,0.06), rgba(215,38,56,0.04))",
                borderColor: "rgba(154,0,255,0.2)"
            }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <span style={{ fontSize: "24px", flexShrink: 0 }}>ℹ️</span>
                    <div>
                        <h4 style={{ fontFamily: "var(--cc-font-heading)", fontWeight: 700, fontSize: "15px", color: "#fff", margin: "0 0 6px" }}>
                            How Staking Works
                        </h4>
                        <ul style={{ margin: 0, padding: "0 0 0 18px", color: "var(--cc-silver)", fontSize: "13px", lineHeight: "1.8" }}>
                            <li>Stake a minimum of <strong style={{ color: "var(--cc-silver-light)" }}>100 CC-CHIP</strong> to activate your account</li>
                            <li>Earn up to <strong style={{ color: "var(--cc-jackpot)" }}>1% daily reward</strong> on your staked amount</li>
                            <li>Build your team and earn <strong style={{ color: "var(--cc-purple)" }}>direct & level reward</strong></li>
                            <li>Withdraw your earnings anytime from the Withdrawal page</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

