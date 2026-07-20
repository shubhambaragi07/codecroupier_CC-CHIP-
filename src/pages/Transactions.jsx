import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import Loader from "../components/Loader";
import Toast, { useToast } from "../components/Toast";

import {
    getDepositHistory,
    getROIHistory,
    getDirectIncome,
    getLevelIncome,
    getWithdrawHistory,
    getRewardHistory,
    getRewardWithdrawHistory
} from "../services/graphService";

const TABS = [
    { id: "deposit",       label: "Deposit",              icon: "⬇️" },
    { id: "roi",           label: "Daily Reward",          icon: "⚡" },
    { id: "direct",        label: "Direct Reward",         icon: "👥" },
    { id: "level",         label: "Level Reward",          icon: "🏆" },
    { id: "withdraw",      label: "Withdraw Self",         icon: "💸" },
    { id: "rewardwithdraw",label: "Withdraw Reward",       icon: "🎁" },
    { id: "reward",        label: "Team Reward",           icon: "🌐" },
];

function fmt(val) { return Number(val) / 1e18; }
function fmtDate(ts) { return new Date(Number(ts) * 1000).toLocaleString(); }
function shortHash(h) { return h ? `${h.substring(0, 10)}...` : "—"; }

function EmptyRow({ cols }) {
    return (
        <tr>
            <td colSpan={cols} className="tx-empty-cell">
                <div className="tx-empty-state">
                    <span className="tx-empty-icon">📭</span>
                    <span>No records found</span>
                </div>
            </td>
        </tr>
    );
}

function TxLink({ hash }) {
    return (
        <a
            href={`https://testnet.bscscan.com/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="tx-hash-link"
        >
            {shortHash(hash)}
            <span className="tx-hash-arrow">↗</span>
        </a>
    );
}

export default function Transactions() {
    const { connected, address } = useWallet();
    const { toasts, toast } = useToast();
    const [activeTab, setActiveTab] = useState("deposit");
    const [animKey, setAnimKey] = useState(0);

    const [deposit, setDeposit] = useState([]);
    const [roi, setROI] = useState([]);
    const [withdraw, setWithdraw] = useState([]);
    const [reward, setReward] = useState([]);
    const [level, setLevel] = useState([]);
    const [direct, setDirect] = useState([]);
    const [rewardWithdraws, setRewardWithdraws] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (connected && address) loadTransactions();
    }, [connected, address]);

    async function loadTransactions() {
        setLoading(true);
        try {
            const [deposits, rois, withdraws, rewards, levels, directs, rewardWithdrawHistory] =
                await Promise.all([
                    getDepositHistory(address),
                    getROIHistory(address),
                    getWithdrawHistory(address),
                    getRewardHistory(address),
                    getLevelIncome(address),
                    getDirectIncome(address),
                    getRewardWithdrawHistory(address),
                ]);
            setDeposit(deposits);
            setROI(rois);
            setWithdraw(withdraws);
            setReward(rewards);
            setLevel(levels);
            setDirect(directs);
            setRewardWithdraws(rewardWithdrawHistory);
        } catch (err) {
            toast.error("Failed to load transactions.");
        } finally {
            setLoading(false);
        }
    }

    function switchTab(id) {
        setActiveTab(id);
        setAnimKey(k => k + 1);
    }

    const counts = {
        deposit: deposit.length,
        roi: roi.length,
        direct: direct.length,
        level: level.length,
        withdraw: withdraw.length,
        rewardwithdraw: rewardWithdraws.length,
        reward: reward.length,
    };

    if (!connected)
        return (
            <>
                <Toast toasts={toasts} />
                <div className="tx-popup-overlay">
                    <div className="tx-popup">
                        <div className="tx-popup-icon">🔌</div>
                        <h3 className="tx-popup-title">Wallet Not Connected</h3>
                        <p className="tx-popup-msg">Please connect your wallet to view your transaction history.</p>
                        <div className="tx-popup-pulse" />
                    </div>
                </div>
            </>
        );

    if (loading)
        return <Loader fullScreen={false} text="Loading transactions..." />;

    return (
        <div className="tx-page">
            <Toast toasts={toasts} />

            {/* ── Page Title ── */}
            <div className="cc-section-title tx-page-title">
                <h1>Transaction History</h1>
                <p>All on-chain activity linked to your wallet</p>
            </div>

            {/* ── Summary Pills ── */}
            <div className="tx-summary-bar">
                {TABS.map(t => (
                    <div key={t.id} className={`tx-summary-pill ${activeTab === t.id ? "tx-summary-pill-active" : ""}`} onClick={() => switchTab(t.id)}>
                        <span className="tx-summary-pill-icon">{t.icon}</span>
                        <span className="tx-summary-pill-label">{t.label}</span>
                        <span className="tx-summary-pill-count">{counts[t.id]}</span>
                    </div>
                ))}
            </div>

            {/* ── Table Card ── */}
            <div className="tx-card" key={animKey}>
                <div className="tx-card-header">
                    <span className="tx-card-header-icon">
                        {TABS.find(t => t.id === activeTab)?.icon}
                    </span>
                    <span className="tx-card-header-title">
                        {TABS.find(t => t.id === activeTab)?.label}
                    </span>
                    <span className="tx-card-header-count">
                        {counts[activeTab]} record{counts[activeTab] !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="tx-table-wrap">
                    <table className="tx-table">

                        {activeTab === "deposit" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date & Time</th>
                                        <th>Amount (CC-CHIP)</th>
                                        <th>Total Deposit (CC-CHIP)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deposit.length === 0 ? <EmptyRow cols={4} /> :
                                        deposit.map((item, i) => (
                                            <tr key={i} className="tx-row" style={{ animationDelay: `${i * 40}ms` }}>
                                                <td className="tx-index">{i + 1}</td>
                                                <td className="tx-date">{fmtDate(item.time)}</td>
                                                <td><span className="tx-amount tx-amount-green">+{fmt(item.amount).toFixed(4)}</span></td>
                                                <td><span className="tx-amount tx-amount-cyan">{fmt(item.totalDeposit).toFixed(4)}</span></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </>
                        )}

                        {activeTab === "roi" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date & Time</th>
                                        <th>Daily Reward (CC-CHIP)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roi.length === 0 ? <EmptyRow cols={3} /> :
                                        roi.map((item, i) => (
                                            <tr key={i} className="tx-row" style={{ animationDelay: `${i * 40}ms` }}>
                                                <td className="tx-index">{i + 1}</td>
                                                <td className="tx-date">{fmtDate(item.time)}</td>
                                                <td><span className="tx-amount tx-amount-green">{fmt(item.totalroi).toFixed(4)}</span></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </>
                        )}

                        {activeTab === "direct" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date & Time</th>
                                        <th>From</th>
                                        <th>Amount (CC-CHIP)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {direct.length === 0 ? <EmptyRow cols={4} /> :
                                        direct.map((item, i) => (
                                            <tr key={i} className="tx-row" style={{ animationDelay: `${i * 40}ms` }}>
                                                <td className="tx-index">{i + 1}</td>
                                                <td className="tx-date">{fmtDate(item.time)}</td>
                                                <td className="tx-addr">{item.from}</td>
                                                <td><span className="tx-amount tx-amount-green">+{fmt(item.amount).toFixed(4)}</span></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </>
                        )}

                        {activeTab === "level" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date & Time</th>
                                        <th>Level</th>
                                        <th>From</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {level.length === 0 ? <EmptyRow cols={5} /> :
                                        level.map((item, i) => (
                                            <tr key={i} className="tx-row" style={{ animationDelay: `${i * 40}ms` }}>
                                                <td className="tx-index">{i + 1}</td>
                                                <td className="tx-date">{fmtDate(item.time)}</td>
                                                <td><span className="tx-level-badge">L{item.level}</span></td>
                                                <td className="tx-addr">{item.from}</td>
                                                <td><span className="tx-amount tx-amount-purple">{item.amount}</span></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </>
                        )}

                        {activeTab === "withdraw" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date & Time</th>
                                        <th>Amount (CC-CHIP)</th>
                                        <th>TX</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withdraw.length === 0 ? <EmptyRow cols={4} /> :
                                        withdraw.map((item, i) => (
                                            <tr key={i} className="tx-row" style={{ animationDelay: `${i * 40}ms` }}>
                                                <td className="tx-index">{i + 1}</td>
                                                <td className="tx-date">{fmtDate(item.time)}</td>
                                                <td><span className="tx-amount tx-amount-green">{fmt(item.amount).toFixed(4)}</span></td>
                                                <td><TxLink hash={item.transactionHash} /></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </>
                        )}

                        {activeTab === "rewardwithdraw" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date & Time</th>
                                        <th>Amount (CC-CHIP)</th>
                                        <th>TX</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rewardWithdraws.length === 0 ? <EmptyRow cols={4} /> :
                                        rewardWithdraws.map((item, i) => (
                                            <tr key={i} className="tx-row" style={{ animationDelay: `${i * 40}ms` }}>
                                                <td className="tx-index">{i + 1}</td>
                                                <td className="tx-date">{fmtDate(item.time)}</td>
                                                <td><span className="tx-amount tx-amount-green">{item.amount}</span></td>
                                                <td><TxLink hash={item.transactionHash} /></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </>
                        )}

                        {activeTab === "reward" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date & Time</th>
                                        <th>Reward ID</th>
                                        <th>Amount (CC-CHIP)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reward.length === 0 ? <EmptyRow cols={4} /> :
                                        reward.map((item, i) => (
                                            <tr key={i} className="tx-row" style={{ animationDelay: `${i * 40}ms` }}>
                                                <td className="tx-index">{i + 1}</td>
                                                <td className="tx-date">{fmtDate(item.time)}</td>
                                                <td><span className="tx-level-badge tx-level-badge-gold">#{item.rewardId}</span></td>
                                                <td><span className="tx-amount tx-amount-green">+{fmt(item.amount).toFixed(4)}</span></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </>
                        )}

                    </table>
                </div>
            </div>
        </div>
    );
}
