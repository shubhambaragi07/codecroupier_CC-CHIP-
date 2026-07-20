import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    BrowserProvider,
    Contract,
    formatEther
} from "ethers";

import {
    useAccount,
    useWalletClient
} from "wagmi";

import ABI from "../abi/CCHIPMLM.json";

import {
    CONTRACT_ADDRESS,
    TOKEN_ADDRESS,
	CHAIN_ID
} from "../config/contract";



const ERC20ABI = [
    "function balanceOf(address) view returns(uint256)",
    "function allowance(address,address) view returns(uint256)",
    "function approve(address,uint256) returns(bool)",
    "function decimals() view returns(uint8)",
    "function symbol() view returns(string)"
];



const WalletContext = createContext();



export const useWallet = () => {
    return useContext(WalletContext);
};





export function WalletProvider({ children }) {


    const {
        address,
        isConnected,
        chainId
    } = useAccount();



    const {
        data: walletClient
    } = useWalletClient({
        chainId: CHAIN_ID
    });




    const [provider, setProvider] = useState(null);

    const [signer, setSigner] = useState(null);


    const [contract, setContract] = useState(null);

    const [token, setToken] = useState(null);



    const [bnbBalance, setBNBBalance] = useState("0");

    const [sitBalance, setSitBalance] = useState("0");



    const [loading, setLoading] = useState(false);





    useEffect(() => {


        if (
            isConnected &&
            address &&
            walletClient
        ) {

            loadWallet();

        } 
        else {

            clearWallet();

        }


    }, [
        isConnected,
        address,
        walletClient
    ]);








    async function loadWallet() {


        try {

            setLoading(true);



            const ethersProvider =
                new BrowserProvider(
                    walletClient.transport
                );



            const ethersSigner =
                await ethersProvider.getSigner();




            const contractInstance =
                new Contract(
                    CONTRACT_ADDRESS,
                    ABI,
                    ethersSigner
                );




            const tokenInstance =
                new Contract(
                    TOKEN_ADDRESS,
                    ERC20ABI,
                    ethersSigner
                );





            const bnb =
                await ethersProvider.getBalance(
                    address
                );



            const sit =
                await tokenInstance.balanceOf(
                    address
                );






            setProvider(
                ethersProvider
            );


            setSigner(
                ethersSigner
            );


            setContract(
                contractInstance
            );


            setToken(
                tokenInstance
            );



            setBNBBalance(
                formatEther(bnb)
            );



            setSitBalance(
                formatEther(sit)
            );




        }
        catch(error){

            console.log(
                "Wallet Error:",
                error
            );

        }
        finally{

            setLoading(false);

        }

    }









    function clearWallet(){


        setProvider(null);

        setSigner(null);

        setContract(null);

        setToken(null);


        setBNBBalance("0");

        setSitBalance("0");


    }










    async function refreshBalances(){


        try{


            if(
                !provider ||
                !token ||
                !address
            ){
                return;
            }




            const bnb =
                await provider.getBalance(
                    address
                );



            const sit =
                await token.balanceOf(
                    address
                );




            setBNBBalance(
                formatEther(bnb)
            );


            setSitBalance(
                formatEther(sit)
            );


        }
        catch(error){

            console.log(
                "Balance Error:",
                error
            );

        }


    }








    return (

        <WalletContext.Provider

            value={{

                // wallet

                address,

                connected: isConnected,

                chainId,



                // ethers

                provider,

                signer,



                // contracts

                contract,

                token,



                // balances

                bnbBalance,

                sitBalance,



                loading,



                refreshBalances


            }}

        >

            {children}


        </WalletContext.Provider>

    );

}