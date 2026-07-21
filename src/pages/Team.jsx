import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import { getTotalDownline, getLevelsSummary, getLevelMembers } from "../services/graphService";
import Loader from "../components/Loader";
import Toast, { useToast } from "../components/Toast";

export default function Team() {

    const { contract, address, connected } = useWallet();
    const { toasts, toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState([]);
    const [user, setUser] = useState(null);
    const [downlineCount, setDownlineCount] = useState(null);

    // Level-based state
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [levelSummaries, setLevelSummaries] = useState([]);
    const [levelMembers, setLevelMembers] = useState([]);
    const [levelsLoading, setLevelsLoading] = useState(false);
    const [memberLoading, setMemberLoading] = useState(false);

    useEffect(() => {

        if (connected && contract && address) {
            loadTeam();
        }

    }, [connected, contract, address]);

    async function loadTeam() {

        try {

            setLoading(true);

            const userData = await contract.users(address);

            setUser({
                referrer: userData.referrer,
                directCount: Number(userData.directCount),
                teamBusiness: ethers.formatEther(userData.teamBusiness)
            });

            let directs = [];
            const total = await getTotalDownline(address);

            for (let i = 0; i < Number(userData.directCount); i++) {

                const member = await contract.getDirect(address, i);

                const detail = await contract.users(member);

                directs.push({
                    wallet: member,
                    deposit: ethers.formatEther(detail.totalDeposit),
                    teamBusiness: ethers.formatEther(detail.teamBusiness),
                    directs: Number(detail.directCount)
                });

            }

            setTeam(directs);
            setDownlineCount(total);

            // Load level summaries after basic team data
            loadLevelsSummary();

        } catch (e) {

            console.log(e);

        }

        setLoading(false);

    }

    const loadLevelsSummary = useCallback(async () => {
        if (!address) return;
        try {
            setLevelsLoading(true);
            const summaries = await getLevelsSummary(address);
            setLevelSummaries(summaries);

            // Auto-select first level with members, or default to level 1
            const firstActive = summaries.find(s => s.count > 0);
            if (firstActive) {
                setSelectedLevel(firstActive.level);
                loadLevelMembers(firstActive.level);
            } else {
                // Load level 1 members even if empty
                setSelectedLevel(1);
                loadLevelMembers(1);
            }
        } catch (e) {
            console.log("Error loading levels summary:", e);
        } finally {
            setLevelsLoading(false);
        }
    }, [address]);

    const loadLevelMembers = useCallback(async (level) => {
        if (!address) return;
        try {
            setMemberLoading(true);
            const members = await getLevelMembers(address, level);
            setLevelMembers(members);
        } catch (e) {
            console.log(`Error loading level ${level} members:`, e);
            setLevelMembers([]);
        } finally {
            setMemberLoading(false);
        }
    }, [address]);

    function handleLevelClick(level) {
        if (level === selectedLevel) return;
        setSelectedLevel(level);
        loadLevelMembers(level);
    }

    // Helper: format deposit amount for display
    function formatDeposit(val) {
        const num = Number(val);
        if (num === 0) return "—";
        return num.toFixed(2);
    }

    // Helper: format large numbers (for counts)
    function formatNumber(val) {
        const num = Number(val);
        if (num === 0) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    }

    if (!connected)
        return (
            <>
                <Toast toasts={toasts} />
                <div className="tx-popup-overlay">
                    <div className="tx-popup">
                        <div className="tx-popup-icon">🔌</div>
                        <h3 className="tx-popup-title">Wallet Not Connected</h3>
                        <p className="tx-popup-msg">Please connect your wallet to view your team.</p>
                        <div className="tx-popup-pulse" />
                    </div>
                </div>
            </>
        );

    if (loading) {

        return <Loader fullScreen={false} text="Loading team data..." />;

    }

    return (
        <div className="db-page">
            <Toast toasts={toasts} />

            {/* ── Page Title ── */}
            <div className="cc-section-title">
                <h1>My Team</h1>
                <p>View your team hierarchy and performance across all levels</p>
            </div>

            {/* ── Stats Cards ── */}
            <div className="cc-grid-4">
                <div className="cc-card cc-glow-red">
                    <div className="cc-withdraw-balance-row">
                        <div className="cc-withdraw-icon" style={{ color: "var(--cc-cyan)", background: "linear-gradient(135deg, rgba(0,232,255,0.15), rgba(154,0,255,0.08))" }}>
                            👤
                        </div>
                        <div>
                            <h5 style={{ fontSize: "13px", color: "var(--cc-silver-border)", margin: 0 }}>Total Direct</h5>
                            <div className="cc-withdraw-balance" style={{ color: "var(--cc-cyan)" }}>{user.directCount}</div>
                        </div>
                    </div>
                </div>

                <div className="cc-card cc-glow-purple">
                    <div className="cc-withdraw-balance-row">
                        <div className="cc-withdraw-icon" style={{ color: "var(--cc-jackpot)", background: "linear-gradient(135deg, rgba(0,197,126,0.15), rgba(0,232,255,0.08))" }}>
                            🌐
                        </div>
                        <div>
                            <h5 style={{ fontSize: "13px", color: "var(--cc-silver-border)", margin: 0 }}>Total Downline</h5>
                            <div className="cc-withdraw-balance" style={{ color: "var(--cc-jackpot)" }}>{downlineCount}</div>
                        </div>
                    </div>
                </div>

                <div className="cc-card" style={{
                    background: "linear-gradient(155deg, rgba(245,166,35,0.10), rgba(255,255,255,0.015) 65%)",
                    borderColor: "rgba(245,166,35,0.3)"
                }}>
                    <div className="cc-withdraw-balance-row">
                        <div className="cc-withdraw-icon" style={{ color: "var(--cc-gold-light)", background: "linear-gradient(135deg, rgba(245,166,35,0.18), rgba(245,166,35,0.04))" }}>
                            💼
                        </div>
                        <div>
                            <h5 style={{ fontSize: "13px", color: "var(--cc-silver-border)", margin: 0 }}>Team Business</h5>
                            <div className="cc-withdraw-balance" style={{ color: "var(--cc-gold-light)" }}>{Number(user.teamBusiness).toFixed(2)} CC-CHIP</div>
                        </div>
                    </div>
                </div>

                <div className="cc-card" style={{
                    background: "linear-gradient(155deg, rgba(154,0,255,0.10), rgba(255,255,255,0.015) 65%)",
                    borderColor: "rgba(154,0,255,0.3)"
                }}>
                    <div className="cc-withdraw-balance-row">
                        <div className="cc-withdraw-icon" style={{ color: "#c084fc", background: "linear-gradient(135deg, rgba(154,0,255,0.18), rgba(154,0,255,0.04))" }}>
                            🔗
                        </div>
                        <div>
                            <h5 style={{ fontSize: "13px", color: "var(--cc-silver-border)", margin: 0 }}>Referrer</h5>
                            <div className="cc-withdraw-balance" style={{ 
                                color: "#c084fc", 
                                fontFamily: "var(--cc-font-mono)", 
                                fontSize: "14px",
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "180px"
                            }}>
                                {user.referrer === "0x0000000000000000000000000000000000000000" 
                                    ? "No Referrer" 
                                    : `${user.referrer.substring(0, 6)}...${user.referrer.substring(38)}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Level Grid ── */}
            <div className="tx-card">
                <div className="tx-card-header">
                    <span className="tx-card-header-icon">📊</span>
                    <span className="tx-card-header-title">Team Levels</span>
                    <span className="tx-card-header-count">
                        {levelsLoading ? "Loading..." : `${levelSummaries.filter(s => s.count > 0).length} active levels`}
                    </span>
                </div>
                <div className="tx-card-body">
                    {levelsLoading ? (
                        <div style={{ padding: "32px", textAlign: "center" }}>
                            <Loader fullScreen={false} text="Building team tree..." />
                        </div>
                    ) : (
                        <div className="cc-level-grid">
                            {levelSummaries.map((summary) => {
                                const isActive = summary.count > 0;
                                const isSelected = selectedLevel === summary.level;
                                return (
                                    <div
                                        key={summary.level}
                                        className={`cc-level-card ${isSelected ? "cc-level-card-selected" : ""} ${isActive ? "cc-level-card-active" : "cc-level-card-empty"}`}
                                        onClick={() => handleLevelClick(summary.level)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="cc-level-card-header">
                                            <span className="cc-level-badge">Level {summary.level}</span>
                                            {isActive && (
                                                <span className="cc-level-member-count">{formatNumber(summary.count)}</span>
                                            )}
                                            {!isActive && (
                                                <span className="cc-level-member-count cc-level-no-members">0</span>
                                            )}
                                        </div>
                                        {isActive && (
                                            <div className="cc-level-card-stats">
                                                <div className="cc-level-stat">
                                                    <span className="cc-level-stat-label">Deposit</span>
                                                    <span className="cc-level-stat-value cc-level-stat-cyan">
                                                        {formatDeposit(summary.totalDeposit / 1e18)}
                                                    </span>
                                                </div>
                                                <div className="cc-level-stat">
                                                    <span className="cc-level-stat-label">Team Biz</span>
                                                    <span className="cc-level-stat-value cc-level-stat-gold">
                                                        {formatDeposit(summary.totalTeamBusiness / 1e18)}
                                                    </span>
                                                </div>
                                                <div className="cc-level-stat">
                                                    <span className="cc-level-stat-label">Downline</span>
                                                    <span className="cc-level-stat-value cc-level-stat-purple">
                                                        {formatNumber(summary.totalDownline)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {!isActive && (
                                            <div className="cc-level-card-empty-msg">
                                                <span>No members</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Level Members Table ── */}
            <div className="tx-card">
                <div className="tx-card-header">
                    <span className="tx-card-header-icon">👥</span>
                    <span className="tx-card-header-title">Level {selectedLevel} — Members</span>
                    <span className="tx-card-header-count">
                        {memberLoading ? "Loading..." : `${levelMembers.length} member${levelMembers.length !== 1 ? "s" : ""}`}
                    </span>
                </div>
                <div className="tx-table-wrap">
                    <table className="tx-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Wallet</th>
                                <th>Deposit</th>
                                <th>Team Business</th>
                                <th>Downline</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberLoading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: 0 }}>
                                        <div className="tx-empty-state">
                                            <Loader fullScreen={false} text="Loading members..." />
                                        </div>
                                    </td>
                                </tr>
                            ) : levelMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: 0 }}>
                                        <div className="tx-empty-state">
                                            <span className="tx-empty-icon">👥</span>
                                            <span>No Members Found</span>
                                            <span style={{ fontSize: "12px", color: "var(--cc-silver-border)" }}>
                                                {selectedLevel === 1 
                                                    ? "Start building your team by sharing your referral link!"
                                                    : `No members at Level ${selectedLevel}. Grow your downline to unlock deeper levels!`
                                                }
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                levelMembers.map((item, index) => (
                                    <tr key={index} className="tx-row" style={{ animationDelay: `${index * 50}ms` }}>
                                        <td className="tx-index">{index + 1}</td>
                                        <td>
                                            <span className="tx-addr" title={item.wallet}>
                                                {item.wallet.substring(0, 8)}...{item.wallet.substring(36)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="tx-amount tx-amount-green">
                                                {formatDeposit(item.deposit)} CC-CHIP
                                            </span>
                                        </td>
                                        <td>
                                            <span className="tx-amount tx-amount-purple">
                                                {formatDeposit(item.teamBusiness)} CC-CHIP
                                            </span>
                                        </td>
                                        <td>
                                            <span className="tx-level-badge">
                                                {item.directs}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

