import { NavLink } from "react-router-dom";
import { useState } from "react";

const links = [
    { to: "/",            end: true,  icon: "fa-home",           label: "Dashboard" },
    { to: "/deposit",     end: false, icon: "fa-wallet",         label: "Deposit" },
    { to: "/claim-roi",   end: false, icon: "fa-chart-line",     label: "Claim ROI" },
    { to: "/withdraw",    end: false, icon: "fa-money-bill-wave",label: "Withdraw" },
    { to: "/team",        end: false, icon: "fa-users",          label: "Team" },
    { to: "/levels",      end: false, icon: "fa-layer-group",    label: "Level Income" },
    { to: "/transactions",end: false, icon: "fa-exchange-alt",   label: "All Transactions" },
];

const NAVBAR_H = 56;

export default function Sidebar({ onWidthChange }) {
    const [collapsed, setCollapsed] = useState(false);
    const width = collapsed ? 64 : 220;

    function toggle() {
        const next = !collapsed;
        setCollapsed(next);
        onWidthChange?.(next ? 64 : 220);
    }

    return (
        <div
            className="bg-dark text-white shadow d-none d-lg-flex flex-column"
            style={{
                position: "fixed",
                top: NAVBAR_H,
                left: 0,
                bottom: 0,
                width,
                transition: "width 0.25s ease",
                overflow: "hidden",
                zIndex: 1040,
            }}
        >
            {/* Toggle button */}
            <div style={{ display: "flex", justifyContent: collapsed ? "center" : "flex-end", padding: "10px 10px 4px" }}>
                <button
                    onClick={toggle}
                    style={{
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "6px",
                        color: "#a0a0b0",
                        width: "30px",
                        height: "30px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    <i className={`fas fa-${collapsed ? "chevron-right" : "chevron-left"}`} style={{ fontSize: "11px" }}></i>
                </button>
            </div>

            {/* Menu */}
            <ul className="nav flex-column p-2" style={{ gap: "2px", overflowY: "auto", overflowX: "hidden" }}>
                {links.map(({ to, end, icon, label }) => (
                    <li className="nav-item" key={to}>
                        <NavLink
                            to={to}
                            end={end}
                            title={collapsed ? label : undefined}
                            className={({ isActive }) =>
                                `nav-link rounded cc-nav-item ${isActive ? "cc-nav-item-active text-white" : "text-light"}`
                            }
                            style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap", padding: "9px 10px" }}
                        >
                            <i className={`fas ${icon}`} style={{ width: "16px", textAlign: "center", flexShrink: 0 }}></i>
                            {!collapsed && <span>{label}</span>}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}