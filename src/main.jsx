import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { wagmiConfig } from "./config/walletConfig";

import { WalletProvider } from "./context/WalletContext";


import App from "./App";
import "./styles/theme.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles/dashboard.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>

        <BrowserRouter>

                <WagmiProvider config={wagmiConfig}>

                <QueryClientProvider client={queryClient}>

                    <WalletProvider>

                        <App />
            

                    </WalletProvider>

                </QueryClientProvider>

            </WagmiProvider>

        </BrowserRouter>

    </React.StrictMode>
);