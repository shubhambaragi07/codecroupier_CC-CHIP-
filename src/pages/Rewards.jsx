import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { getRewardAchieved, getRewardHistory } from "../services/graphService";
import Toast, { useToast } from "../components/Toast";

const REWARDS = [
    { id: 1, business: 2500,   reward: 100    },
    { id: 2, business: 7500,   reward: 250    },
    { id: 3, business: 17500,  reward: 750    },
    { id: 4, business: 42500,  reward: 3000   },
    { id: 5, business: 142500, reward: 15000  },
    { id: 6, business: 642500, reward: 100000 },
];

export default function Reward() {
    const { contract, address, connected, refreshBalances } = useWallet();
    const [loading, setLoading] = useState(false);
    const [achievedRewards, setAchievedRewards] = useState([]);
    const [claimedRewards, setClaimedRewards] = useState([]);
    const { toasts, toast } = useToast();

    useEffect(() => {
        if (connected && address) loadRewards();
    }, [connected, address]);

    async function loadRewards() {
        try {
            const [achieved, claimed] = await Promise.all([
                getRewardAchieved(address),
                getRewardHistory(address),
            ]);
            setAchievedRewards(achieved);
            setClaimedRewards(claimed);
        } catch (err) {
            console.log(err);
        }
    }

    async function claimReward(id) {
        try {
            setLoading(true);
            const tx = await contract.claimReward(id);
            await tx.wait();
            await refreshBalances();
            await loadRewards();
            toast.success("Reward Claimed Successfully! 🎉");
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
                        <p className="tx-popup-msg">Please connect your wallet to view rewards.</p>
                        <div className="tx-popup-pulse" />
                    </div>
                </div>
            </>
        );

    return (
        <div className="container-fluid">
            <Toast toasts={toasts} />
            <h2 className="mb-4">Rewards</h2>

            <div className="card shadow">
                <div className="card-header bg-danger text-white">Reward List</div>
                <div className="card-body p-0">
                    <table className="table table-bordered table-hover mb-0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Required Business</th>
                                <th>Reward</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {REWARDS.map((reward) => {
                                const eligible = achievedRewards.some(x => Number(x.rewardId) === reward.id);
                                const claimed  = claimedRewards.some(x => Number(x.rewardId) === reward.id);
                                return (
                                    <tr key={reward.id}>
                                        <td>{reward.id}</td>
                                        <td>{reward.business} SIT</td>
                                        <td>{reward.reward} SIT</td>
                                        <td>
                                            {claimed   ? <span className="badge bg-success">Claimed</span>
                                            : eligible ? <span className="badge bg-primary">Eligible</span>
                                                       : <span className="badge bg-secondary">Locked</span>}
                                        </td>
                                        <td>
                                            {eligible && !claimed ? (
                                                <button className="btn btn-success btn-sm" onClick={() => claimReward(reward.id)} disabled={loading}>
                                                    Claim Reward
                                                </button>
                                            ) : "-"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card shadow mt-4">
                <div className="card-header bg-success text-white">Claimed Reward History</div>
                <div className="card-body p-0">
                    <table className="table table-striped mb-0">
                        <thead>
                            <tr>
                                <th>Reward ID</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claimedRewards.length === 0 ? (
                                <tr><td colSpan="3" className="text-center">No Reward Claimed</td></tr>
                            ) : (
                                claimedRewards.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.rewardId}</td>
                                        <td>{Number(item.amount) / 1e18}</td>
                                        <td>{new Date(Number(item.time) * 1000).toLocaleString()}</td>
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
