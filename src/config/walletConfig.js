import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { bscTestnet } from "wagmi/chains";

const projectId = "f79ed6c055343ff720e44ee38d8d6270";

const metadata = {
  name: "My DApp",
  description: "WalletConnect Demo",
  url: "http://localhost:5173",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [bscTestnet];

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
});