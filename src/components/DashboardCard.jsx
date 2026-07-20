import React from "react";
import { Link } from "react-router-dom";

export default function DashboardCard({
    title,
    value = "0",
    icon,
    color = "primary",
    link = "",
    loading = false
}) {

    return (

        <div className="col-xl-3 col-md-6 mb-4">

            <div className={`card border-left-${color} shadow h-100 py-2`}>

                <div className="card-body">

                    <div className="row align-items-center">

                        <div className="col">

                            <div
                                className={`text-xs fw-bold text-${color} text-uppercase mb-1`}
                            >
                                {title}
                            </div>

                            <div className="h5 mb-0 fw-bold text-gray-800">

                                {loading ? (

                                    <div
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                    />

                                ) : (
                                    value
                                )}

                            </div>

                        </div>

                        <div className="col-auto">

                            <i
                                className={`${icon} fa-2x text-secondary`}
                            ></i>

                        </div>

                    </div>

                </div>

                {link !== "" && (

                    <div className="card-footer bg-transparent">

                        <Link
                            to={link}
                            className="small text-decoration-none"
                        >
                            View Details →
                        </Link>

                    </div>

                )}

            </div>

        </div>

    );

}