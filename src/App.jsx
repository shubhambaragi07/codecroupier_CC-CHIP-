import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Loader from "./components/Loader";
import { useWallet } from "./context/WalletContext";

import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import ClaimROI from "./pages/ClaimROI";
import Rewards from "./pages/Rewards";
import Withdrawal from "./pages/Withdraw";
import Team from "./pages/Team";
import Transactions from "./pages/Transactions";
import Levels from "./pages/Levels";

const NAVBAR_H = 56;
const LG_BREAKPOINT = 992;

function App() {
    const { loading } = useWallet();
    const [sidebarWidth, setSidebarWidth] = useState(220);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= LG_BREAKPOINT);

    useEffect(() => {
        const handler = () => setIsDesktop(window.innerWidth >= LG_BREAKPOINT);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    return (
        <>
            {loading && <Loader text="Connecting wallet..." />}
            <Navbar />
            <Sidebar onWidthChange={setSidebarWidth} />

            <div
                className="flex-grow-1 p-3 p-md-4 bg-light"
                style={{
                    marginTop: NAVBAR_H,
                    marginLeft: isDesktop ? sidebarWidth : 0,
                    minHeight: `calc(100vh - ${NAVBAR_H}px)`,
                    transition: "margin-left 0.25s ease",
                }}
            >
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/stake" element={<Deposit />} />
                    <Route path="/claim-roi" element={<ClaimROI />} />
                    <Route path="/rewards" element={<Rewards />} />
                    <Route path="/Withdrawal" element={<Withdrawal />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/levels" element={<Levels />} />
                </Routes>
            </div>
        </>
    );
}

export default App;
