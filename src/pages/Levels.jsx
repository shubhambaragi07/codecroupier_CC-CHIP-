import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { getLevelIncome } from "../services/graphService";
import Loader from "../components/Loader";
import Toast, { useToast } from "../components/Toast";

export default function Levels() {

    const { connected, address } = useWallet();
    const { toasts, toast } = useToast();

    const [levels, setLevels] = useState({});
    const [activeLevel, setActiveLevel] = useState(1);
    const [levelCount, setLevelCount] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (connected && address) {
            loadLevels();
        }
    }, [connected, address]);

    async function loadLevels() {
        setLoading(true);
        try {
            const data = await getLevelIncome(address);

            let grouped = {};
            let counts = {};

            for (let i = 1; i <= 15; i++) {
                grouped[i] = [];
                counts[i] = 0;
            }

            data.forEach(item => {
                const level = Number(item.level);
                grouped[level].push(item);
                counts[level]++;
            });

            setLevels(grouped);
            setLevelCount(counts);
        } finally {
            setLoading(false);
        }
    }

    if (!connected)
        return (
            <>
                <Toast toasts={toasts} />
                <div className="tx-popup-overlay">
                    <div className="tx-popup">
                        <div className="tx-popup-icon">🔌</div>
                        <h3 className="tx-popup-title">Wallet Not Connected</h3>
                        <p className="tx-popup-msg">Please connect your wallet to view level income.</p>
                        <div className="tx-popup-pulse" />
                    </div>
                </div>
            </>
        );

    if (loading)
        return <Loader fullScreen={false} text="Loading level income..." />;

    return (
        <div className="container-fluid">
            <Toast toasts={toasts} />
            <h2 className="mb-4">Level Income</h2>

            <ul className="nav nav-tabs flex-wrap mb-4">
                {[...Array(15)].map((_, index) => {
                    const level = index + 1;
                    return (
                        <li className="nav-item" key={level}>
                            <button
                                className={`nav-link ${activeLevel === level ? "active" : ""}`}
                                onClick={() => setActiveLevel(level)}
                            >
                                Level {level}
                                <br />
                                <span className="badge bg-dark ms-2">
                                    {levelCount[level] || 0}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="card shadow">

                <div className="card-header bg-primary text-white">
                    Level {activeLevel} Income
                </div>

                <div className="card-body p-0">
                    <table className="table table-striped mb-0">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>From</th>
                                <th>Amount</th>
                                <th>Tx Hash</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!levels[activeLevel] || levels[activeLevel].length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center">No Records</td>
                                </tr>
                            ) : (
                                levels[activeLevel].map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.date}</td>
                                        <td>{item.from}</td>
                                        <td>{item.amount} CC-CHIP</td>
                                        <td>
                                            <a
                                                href={`https://testnet.bscscan.com/tx/${item.transactionHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {item.transactionHash.substring(0, 10)}...
                                            </a>
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
