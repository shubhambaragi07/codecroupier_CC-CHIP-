import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import { getTotalDownline } from "../services/graphService";
import Loader from "../components/Loader";
import Toast, { useToast } from "../components/Toast";

export default function Team() {

    const { contract, address, connected } = useWallet();
    const { toasts, toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState([]);
    const [user, setUser] = useState(null);
    const [downlineCount, setDownlineCount] = useState(null);

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

        } catch (e) {

            console.log(e);

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
                <p>View your direct referrals and team performance</p>
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

            {/* ── Direct Members Table ── */}
            <div className="tx-card">
                <div className="tx-card-header">
                    <span className="tx-card-header-icon">👥</span>
                    <span className="tx-card-header-title">Direct Members</span>
                    <span className="tx-card-header-count">{team.length} member{team.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="tx-table-wrap">
                    <table className="tx-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Wallet</th>
                                <th>Deposit</th>
                                <th>Team Business</th>
                                <th>Directs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: 0 }}>
                                        <div className="tx-empty-state">
                                            <span className="tx-empty-icon">👥</span>
                                            <span>No Team Found</span>
                                            <span style={{ fontSize: "12px", color: "var(--cc-silver-border)" }}>
                                                Start building your team by sharing your referral link!
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                team.map((item, index) => (
                                    <tr key={index} className="tx-row" style={{ animationDelay: `${index * 50}ms` }}>
                                        <td className="tx-index">{index + 1}</td>
                                        <td>
                                            <span className="tx-addr" title={item.wallet}>
                                                {item.wallet.substring(0, 8)}...{item.wallet.substring(36)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="tx-amount tx-amount-green">
                                                {Number(item.deposit).toFixed(2)} CC-CHIP
                                            </span>
                                        </td>
                                        <td>
                                            <span className="tx-amount tx-amount-purple">
                                                {Number(item.teamBusiness).toFixed(2)} CC-CHIP
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

