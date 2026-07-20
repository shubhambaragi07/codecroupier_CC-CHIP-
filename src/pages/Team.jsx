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
        <div className="container-fluid">
            <Toast toasts={toasts} />
            <h3 className="mb-4">My Team</h3>

            <div className="row mb-4">

                <div className="col-md-3">

                    <div className="card shadow">

                        <div className="card-body">

                            <h6>Total Direct</h6>

                            <h2>{user.directCount}</h2>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div className="card border-success shadow">

                        <div className="card-body text-center">

                            <h5>Total Downline</h5>

                            <h2>{downlineCount}</h2>

                        </div>

                    </div>

                </div>    

                <div className="col-md-3">

                    <div className="card shadow">

                        <div className="card-body">

                            <h6>Team Business</h6>

                            <h2>{user.teamBusiness} CC-CHIP</h2>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div className="card shadow">

                        <div className="card-body">

                            <h6>Referrer</h6>

                            <small>

                                {user.referrer}

                            </small>

                        </div>

                    </div>

                </div>

            </div>

            <div className="card shadow">

                <div className="card-header bg-primary text-white">

                    Direct Members

                </div>

                <div className="card-body p-0">

                    <table className="table table-striped mb-0">

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

                            {

                                team.length === 0 ?

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="text-center">

                                        No Team Found

                                    </td>

                                </tr>

                                :

                                team.map((item,index)=>(

                                    <tr key={index}>

                                        <td>{index+1}</td>

                                        <td>

                                            {item.wallet.substring(0,8)}
                                            ...
                                            {item.wallet.substring(38)}

                                        </td>

                                        <td>{item.deposit} CC-CHIP</td>

                                        <td>{item.teamBusiness} CC-CHIP</td>

                                        <td>{item.directs}</td>

                                    </tr>

                                ))

                            }

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

}