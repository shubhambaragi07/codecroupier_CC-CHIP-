import { Link, NavLink } from "react-router-dom";
import WalletButton from "./WalletButton";
import Logo from "./Logo";

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container-fluid">

                {/* Logo */}
                <Link className="navbar-brand fw-bold" to="/">
                   <Logo/>
                </Link>

                {/* Mobile Toggle */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarMenu"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Menu */}
                <div
                    className="collapse navbar-collapse"
                    id="navbarMenu"
                >
                    {/* Sidebar links — visible only on mobile (hidden on lg+) */}
                    <ul className="navbar-nav me-auto d-lg-none">
                        <li className="nav-item">
                            <NavLink to="/" end className={({ isActive }) => `nav-link rounded cc-nav-item ${isActive ? "cc-nav-item-active text-white" : "text-light"}`}>
                                <i className="fas fa-home me-2"></i>Dashboard
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/stake" className={({ isActive }) => `nav-link rounded cc-nav-item ${isActive ? "cc-nav-item-active text-white" : "text-light"}`}>
                                <i className="fas fa-wallet me-2"></i>Stake
                            </NavLink>
                        </li>
                        {/* <li className="nav-item">
                            <NavLink to="/claim-roi" className={({ isActive }) => `nav-link rounded cc-nav-item ${isActive ? "cc-nav-item-active text-white" : "text-light"}`}>
                                <i className="fas fa-chart-line me-2"></i>Claim ROI
                            </NavLink>
                        </li> */}
                        <li className="nav-item">
                            <NavLink to="/withdraw" className={({ isActive }) => `nav-link rounded cc-nav-item ${isActive ? "cc-nav-item-active text-white" : "text-light"}`}>
                                <i className="fas fa-money-bill-wave me-2"></i>Withdraw
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/team" className={({ isActive }) => `nav-link rounded cc-nav-item ${isActive ? "cc-nav-item-active text-white" : "text-light"}`}>
                                <i className="fas fa-users me-2"></i>Team
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/rewards" className={({ isActive }) => `nav-link rounded cc-nav-item ${isActive ? "cc-nav-item-active text-white" : "text-light"}`}>
                                <i className="fas fa-gift me-2"></i>Rewards
                            </NavLink>
                        </li>
                        {/* <li className="nav-item">
                            <NavLink to="/levels" className={({ isActive }) => `nav-link rounded cc-nav-item ${isActive ? "cc-nav-item-active text-white" : "text-light"}`}>
                                <i className="fas fa-layer-group me-2"></i>Level Income
                            </NavLink>
                        </li> */}
                        <li className="nav-item">
                            <NavLink to="/transactions" className={({ isActive }) => `nav-link rounded cc-nav-item ${isActive ? "cc-nav-item-active text-white" : "text-light"}`}>
                                <i className="fas fa-exchange-alt me-2"></i>All Transactions
                            </NavLink>
                        </li>
                    </ul>

                    {/* Wallet — pushed to far right */}
                    <div className="ms-auto">
                        <WalletButton />
                    </div>

                </div>

            </div>
        </nav>
    );
}