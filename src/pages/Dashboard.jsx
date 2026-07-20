import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import Loader from "../components/Loader";
import Toast, { useToast } from "../components/Toast";
import { getDashboard, getDepositHistory, getROIHistory } from "../services/graphService";
import { ERC20ABI } from "../abi/ERC20ABI";
import TokenPrice from "../components/TokenPrice";
import ROIWidget from "../components/ROIWidget";

const REWARD_MILESTONES = [
    { id: 1, label: "Starter",   business: 2500,   reward: 100,    icon: "🥉" },
    { id: 2, label: "Bronze",    business: 7500,   reward: 250,    icon: "🥈" },
    { id: 3, label: "Silver",    business: 17500,  reward: 750,    icon: "🥇" },
    { id: 4, label: "Gold",      business: 42500,  reward: 3000,   icon: "💎" },
    { id: 5, label: "Platinum",  business: 142500, reward: 15000,  icon: "👑" },
    { id: 6, label: "Diamond",   business: 642500, reward: 100000, icon: "🚀" },
];

const HOW_IT_WORKS = [
    { icon: "🔗", title: "Connect Wallet",   desc: "Link your BSC wallet to get started instantly." },
    { icon: "💰", title: "Deposit CC-CHIP",   desc: "Deposit multiples of 100 CC-CHIP to activate your account." },
    { icon: "📈", title: "Earn Daily Reward", desc: "Earn up to 1% daily reward on your active deposit." },
    { icon: "👥", title: "Refer & Earn",     desc: "Get direct & level income by growing your team." },
];

function StatCard({ icon, label, value, accent, delay = 0 }) {
    return (
        <div className="db-stat-card" style={{ animationDelay: `${delay}ms` }}>
            <div className={`db-stat-icon db-accent-${accent}`}>{icon}</div>
            <div className="db-stat-body">
                <div className="db-stat-label">{label}</div>
                <div className="db-stat-value">{value}</div>
            </div>
        </div>
    );
}

function MiniTable({ title, icon, cols, rows, emptyMsg }) {
    return (
        <div className="db-mini-table-card">
            <div className="db-mini-table-header">
                <span className="db-mini-table-icon">{icon}</span>
                <span className="db-mini-table-title">{title}</span>
            </div>
            <div className="db-mini-table-wrap">
                <table className="db-mini-table">
                    <thead>
                        <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                        {rows.length === 0
                            ? <tr><td colSpan={cols.length} className="db-mini-empty">{emptyMsg}</td></tr>
                            : rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { address, contract, connected } = useWallet();
    const { toasts, toast } = useToast();
    const [dashboard, setDashboard] = useState(null);
    const [depositHistory, setDepositHistory] = useState([]);
    const [roiHistory, setROIHistory] = useState([]);
    const [copied, setCopied] = useState(false);

    const referralLink = `${window.location.origin}/deposit?ref=${address}`;

    useEffect(() => {
        if (!connected || !contract || !address) return;
        loadDashboard();
    }, [connected, contract, address]);

    async function loadDashboard() {
        try {
            const user = await getDashboard(address);
            const provider = contract.runner.provider;
            const bnbBalance = await provider.getBalance(address);
            const tokenAddress = await contract.token();
            const token = new ethers.Contract(tokenAddress, ERC20ABI, provider);
            const tokenBalance = await token.balanceOf(address);
            const income = await contract.getIncomeSummary(address);
            const remaining = await contract.remainingPayout(address);
            const eligible = await contract.getEligibleBusiness(address);
            const active = await contract.isActive(address);

            setDashboard({
                exists: !!user,
                totalDeposit:     Number(user?.totalDeposit  || 0) / 1e18,
                directIncome:     Number(user?.directIncome  || 0) / 1e18,
                levelIncome:      Number(user?.levelIncome   || 0) / 1e18,
                roiIncome:        Number(user?.roiIncome     || 0) / 1e18,
                rewardIncome:     Number(user?.rewardIncome  || 0) / 1e18,
                totalIncome:      Number(user?.totalIncome   || 0) / 1e18,
                teamBusiness:     Number(user?.teamBusiness  || 0) / 1e18,
                directCount:      Number(user?.directCount   || 0),
                remainingPayout:  Number(ethers.formatEther(remaining)).toFixed(2),
                eligibleBusiness: Number(ethers.formatEther(eligible)).toFixed(2),
                active,
                bnbBalance:   Number(ethers.formatEther(bnbBalance)).toFixed(4),
                tokenBalance: Number(ethers.formatEther(tokenBalance)).toFixed(2),
                myBalance:    Number(ethers.formatEther(income.withdrawable)).toFixed(2),
            });

            const [deposits, roi] = await Promise.all([
                getDepositHistory(address),
                getROIHistory(address),
            ]);
            setDepositHistory(deposits.slice(0, 5));
            setROIHistory(roi.slice(0, 5));
        } catch (err) {
            console.log(err);
            toast.error("Failed to load dashboard data.");
        }
    }

    function copyReferral() {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 2000);
    }

    if (!connected)
        return (
            <>
                <Toast toasts={toasts} />
                <div className="tx-popup-overlay">
                    <div className="tx-popup">
                        <div className="tx-popup-icon">🔌</div>
                        <h3 className="tx-popup-title">Wallet Not Connected</h3>
                        <p className="tx-popup-msg">Please connect your wallet to access your dashboard.</p>
                        <div className="tx-popup-pulse" />
                    </div>
                </div>
            </>
        );

    if (!dashboard)
        return <Loader fullScreen={false} text="Loading dashboard..." />;

    const nextMilestone = REWARD_MILESTONES.find(m => dashboard.teamBusiness < m.business);
    const prevMilestone = nextMilestone
        ? REWARD_MILESTONES[REWARD_MILESTONES.indexOf(nextMilestone) - 1]
        : REWARD_MILESTONES[REWARD_MILESTONES.length - 1];
    const progressPct = nextMilestone
        ? Math.min(100, ((dashboard.teamBusiness - (prevMilestone?.business || 0)) / (nextMilestone.business - (prevMilestone?.business || 0))) * 100)
        : 100;

    return (
        <div className="db-page">
            <Toast toasts={toasts} />

            {/* ── Page Title ── */}
            <div className="cc-section-title">
                <h1>Dashboard</h1>
                <p>Overview of your CC-CHIP Stakeup account activity</p>
            </div>

            {/* ── Hero Banner ── */}
            <div className="db-hero">
                <div className="db-hero-left">
                    <div className="db-hero-badge">
                        <span className={`db-status-dot ${dashboard.active ? "db-dot-green" : "db-dot-red"}`} />
                        {dashboard.active ? "Account Active" : "Account Inactive"}
                    </div>
                    <h1 className="db-hero-title">
                        Welcome back,<br />
                        <span className="db-hero-addr">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </h1>
                    <p className="db-hero-sub">Your CC-CHIP Stakeup dashboard — track earnings, team & rewards in real time.</p>
                    <div className="db-hero-chips">
                        <div className="db-hero-chip">
                            <span className="db-hero-chip-label">BNB Balance</span>
                            <span className="db-hero-chip-val">{dashboard.bnbBalance} BNB</span>
                        </div>
                        <div className="db-hero-chip">
                            <span className="db-hero-chip-label">CC-CHIP Balance</span>
                            <span className="db-hero-chip-val">{dashboard.tokenBalance} CC-CHIP</span>
                        </div>
                        <div className="db-hero-chip db-hero-chip-green">
                            <span className="db-hero-chip-label">Withdrawable Balance</span>
                            <span className="db-hero-chip-val">{dashboard.myBalance} CC-CHIP</span>
                        </div>
                    </div>
                </div>
                <div className="db-hero-right">
                    <div className="db-hero-ring">
                        <div className="db-hero-ring-inner">
                            <div className="db-hero-ring-label">Total Income</div>
                            <div className="db-hero-ring-value">{dashboard.totalIncome.toFixed(2)}</div>
                            <div className="db-hero-ring-unit">CC-CHIP</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="db-stats-grid">
                <StatCard icon="💰" label="Total Deposit"          value={`${dashboard.totalDeposit.toFixed(2)} CC-CHIP`}    accent="cyan"   delay={0}   />
                <StatCard icon="🟢" label="Active Deposit"          value={`${dashboard.totalDeposit.toFixed(2)} CC-CHIP`}    accent="green"  delay={60}  />
                <StatCard icon="⚡" label="Available Daily Reward"  value={`${dashboard.roiIncome.toFixed(2)} CC-CHIP`}       accent="green"  delay={120} />
                <StatCard icon="💰" label="Total Daily Reward"      value={`${dashboard.roiIncome.toFixed(2)} CC-CHIP`}       accent="cyan"   delay={180} />
                <StatCard icon="👥" label="Total Direct Reward"     value={`${dashboard.directIncome.toFixed(2)} CC-CHIP`}    accent="purple" delay={240} />
                <StatCard icon="🏆" label="Total Level Reward"      value={`${dashboard.levelIncome.toFixed(2)} CC-CHIP`}     accent="gold"   delay={300} />
                <StatCard icon="🎁" label="Total Team Reward"       value={`${dashboard.rewardIncome.toFixed(2)} CC-CHIP`}    accent="red"    delay={360} />
                <StatCard icon="🌐" label="Team Business"           value={`${dashboard.teamBusiness.toFixed(2)} CC-CHIP`}    accent="cyan"   delay={420} />
                <StatCard icon="👤" label="Direct Referrals"        value={dashboard.directCount}                             accent="purple" delay={480} />
                <StatCard icon="⏳" label="Remaining Payout"        value={`${dashboard.remainingPayout} CC-CHIP`}            accent="gold"   delay={540} />
            </div>

            {/* ── Widgets Row ── */}
            <div className="db-widgets-row">
                <TokenPrice />
                <ROIWidget contract={contract} userAddress={address} />
            </div>

            {/* ── Reward Progress ── */}
            <div className="db-section-label">🏅 Reward Progress</div>
            <div className="db-reward-progress-card">
                <div className="db-reward-progress-top">
                    <div>
                        <div className="db-reward-progress-title">
                            {nextMilestone ? `Next: ${nextMilestone.label} Reward` : "🎉 All Rewards Unlocked!"}
                        </div>
                        <div className="db-reward-progress-sub">
                            Team Business: <strong>{dashboard.teamBusiness.toFixed(0)} CC-CHIP</strong>
                            {nextMilestone && <> &nbsp;/&nbsp; Target: <strong>{nextMilestone.business.toLocaleString()} CC-CHIP</strong></>}
                        </div>
                    </div>
                    {nextMilestone && (
                        <div className="db-reward-progress-reward">
                            {nextMilestone.icon} <span>+{nextMilestone.reward.toLocaleString()} CC-CHIP</span>
                        </div>
                    )}
                </div>
                <div className="db-progress-bar-wrap">
                    <div className="db-progress-bar" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="db-reward-milestones">
                    {REWARD_MILESTONES.map(m => {
                        const done = dashboard.teamBusiness >= m.business;
                        return (
                            <div key={m.id} className={`db-milestone ${done ? "db-milestone-done" : ""}`}>
                                <span className="db-milestone-icon">{m.icon}</span>
                                <span className="db-milestone-label">{m.label}</span>
                                <span className="db-milestone-val">{m.business >= 1000 ? `${m.business / 1000}K` : m.business}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Referral Link ── */}
            <div className="db-section-label">🔗 Your Referral Link</div>
            <div className="db-referral-card">
                <div className="db-referral-info">
                    <div className="db-referral-title">Invite & Earn Direct Income</div>
                    <div className="db-referral-sub">Share your link — earn on every deposit your referrals make.</div>
                </div>
                <div className="db-referral-row">
                    <div className="db-referral-link-box">{referralLink}</div>
                    <button className={`db-referral-copy-btn ${copied ? "db-referral-copy-btn-done" : ""}`} onClick={copyReferral}>
                        {copied ? "✅ Copied!" : "📋 Copy"}
                    </button>
                </div>
            </div>

            {/* ── How It Works ── */}
            <div className="db-section-label">⚡ How It Works</div>
            <div className="db-how-grid">
                {HOW_IT_WORKS.map((step, i) => (
                    <div key={i} className="db-how-card" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="db-how-step">{i + 1}</div>
                        <div className="db-how-icon">{step.icon}</div>
                        <div className="db-how-title">{step.title}</div>
                        <div className="db-how-desc">{step.desc}</div>
                    </div>
                ))}
            </div>

            {/* ── Recent Activity ── */}
            <div className="db-section-label">📊 Recent Activity</div>
            <div className="db-tables-row">
                <MiniTable
                    title="Recent Deposits"
                    icon="⬇️"
                    cols={["Date", "Amount", "Total"]}
                    emptyMsg="No deposits yet"
                    rows={depositHistory.map(item => [
                        new Date(Number(item.time) * 1000).toLocaleDateString(),
                        <span className="tx-amount tx-amount-green">+{(Number(item.amount) / 1e18).toFixed(2)}</span>,
                        <span className="tx-amount tx-amount-cyan">{(Number(item.totalDeposit) / 1e18).toFixed(2)}</span>,
                    ])}
                />
                <MiniTable
                    title="Recent Rewards"
                    icon="⚡"
                    cols={["Date", "Daily Reward"]}
                    emptyMsg="No reward history yet"
                    rows={roiHistory.map(item => [
                        new Date(Number(item.time) * 1000).toLocaleDateString(),
                        <span className="tx-amount tx-amount-green">{(Number(item.totalroi) / 1e18).toFixed(4)}</span>,
                    ])}
                />
            </div>

            {/* ── Income Breakdown ── */}
            <div className="db-section-label">💹 Income Breakdown</div>
            <div className="db-income-breakdown">
                {[
                    { label: "Total Daily Reward",  val: dashboard.roiIncome,    color: "#00E8FF", pct: dashboard.totalIncome > 0 ? (dashboard.roiIncome / dashboard.totalIncome) * 100 : 0 },
                    { label: "Total Direct Reward",  val: dashboard.directIncome, color: "#9A00FF", pct: dashboard.totalIncome > 0 ? (dashboard.directIncome / dashboard.totalIncome) * 100 : 0 },
                    { label: "Total Level Reward",   val: dashboard.levelIncome,  color: "#F5A623", pct: dashboard.totalIncome > 0 ? (dashboard.levelIncome / dashboard.totalIncome) * 100 : 0 },
                    { label: "Total Team Reward",    val: dashboard.rewardIncome, color: "#FF2E55", pct: dashboard.totalIncome > 0 ? (dashboard.rewardIncome / dashboard.totalIncome) * 100 : 0 },
                ].map((item, i) => (
                    <div key={i} className="db-income-row">
                        <div className="db-income-row-label">
                            <span className="db-income-dot" style={{ background: item.color }} />
                            {item.label}
                        </div>
                        <div className="db-income-bar-wrap">
                            <div className="db-income-bar" style={{ width: `${item.pct}%`, background: item.color }} />
                        </div>
                        <div className="db-income-row-val">{item.val.toFixed(2)} CC-CHIP</div>
                    </div>
                ))}
            </div>

        </div>
    );
}
