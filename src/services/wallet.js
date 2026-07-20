import { BrowserProvider, Contract, formatEther } from "ethers";

import MLMABI from "../abi/CCHIPMLM.json";

import {
    CONTRACT_ADDRESS,
    TOKEN_ADDRESS,
    CHAIN_ID
} from "../config/contract";

const ERC20ABI = [
    "function approve(address spender,uint256 amount) returns(bool)",
    "function allowance(address owner,address spender) view returns(uint256)",
    "function balanceOf(address owner) view returns(uint256)",
    "function decimals() view returns(uint8)",
    "function symbol() view returns(string)"
];

class WalletService {

    constructor() {

        this.provider = null;
        this.signer = null;
        this.account = null;

        this.contract = null;
        this.token = null;

    }

    async connect() {

        if (!window.ethereum) {
            throw new Error("Please install MetaMask");
        }

        await window.ethereum.request({
            method: "eth_requestAccounts"
        });

        this.provider = new BrowserProvider(window.ethereum);

        const network = await this.provider.getNetwork();

        if (Number(network.chainId) !== CHAIN_ID) {

            await this.switchNetwork();

        }

        this.signer = await this.provider.getSigner();

        this.account = await this.signer.getAddress();

        this.contract = new Contract(
            CONTRACT_ADDRESS,
            MLMABI,
            this.signer
        );

        this.token = new Contract(
            TOKEN_ADDRESS,
            ERC20ABI,
            this.signer
        );

        return this.account;

    }

    async reconnect() {

        if (!window.ethereum)
            return null;

        const accounts = await window.ethereum.request({
            method: "eth_accounts"
        });

        if (accounts.length === 0)
            return null;

        return await this.connect();

    }

    async switchNetwork() {

        try {

            await window.ethereum.request({

                method: "wallet_switchEthereumChain",

                params: [
                    {
                        chainId: "0x61"
                    }
                ]

            });

        } catch (err) {

            console.log(err);

            throw new Error("Please switch to BSC Testnet");

        }

    }

    async getBNBBalance() {

        if (!this.provider)
            return "0";

        const balance = await this.provider.getBalance(
            this.account
        );

        return formatEther(balance);

    }

    async getTokenBalance() {

        if (!this.token)
            return "0";

        const balance = await this.token.balanceOf(
            this.account
        );

        return formatEther(balance);

    }

    async getAllowance() {

        return await this.token.allowance(
            this.account,
            CONTRACT_ADDRESS
        );

    }

     getContract() {
        return this.contract;
    }

    disconnect() {

        this.provider = null;

        this.signer = null;

        this.account = null;

        this.contract = null;

        this.token = null;

    }

    onAccountsChanged(callback) {

        if (!window.ethereum)
            return;

        window.ethereum.on(
            "accountsChanged",
            callback
        );

    }

    onChainChanged(callback) {

        if (!window.ethereum)
            return;

        window.ethereum.on(
            "chainChanged",
            callback
        );

    }

    removeListeners() {

        if (!window.ethereum)
            return;

        window.ethereum.removeAllListeners(
            "accountsChanged"
        );

        window.ethereum.removeAllListeners(
            "chainChanged"
        );

    }

}

export default new WalletService();