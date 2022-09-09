import './App.css';
import Web3Modal from 'web3modal'
import { providers, Contract, utils, ethers } from "ethers"
import { useRef, useEffect, useState } from "react"
import { contract_ABI, contract_ADDRESS } from '../src/constants'


function App() {
  const web3ModalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false)
  const [user, setUser] = useState('')
  const [contractBalance, setContractBalance] = useState('')
  const [accountBalance, setAccountBalance] = useState('')

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const accounts = await window.ethereum.request({
      method:"eth_requestAccounts"
    })
    setUser(accounts[0])
    //this gets the account of the current user
    console.log("connected account: ", accounts[0]);
    //get the balance of the connected account
    const balance = await web3Provider.getBalance(accounts[0])
    const number = balance / 10 ** 18
    const userBalance = number.toFixed(4)
    // const cheese = balance.toString()
    console.log("balance", number)
    setAccountBalance(userBalance)

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async() =>{
    try{
      await getProviderOrSigner()
      setWalletConnected(true)
    }catch(err){console.error(err)}
  }

  useEffect(() => {
    if (!walletConnected) {

      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected, user]);

  const getOwner = async() =>{
    const provider = await getProviderOrSigner();
    const walletContract = new Contract( contract_ADDRESS,contract_ABI, provider);
    const _owner = await walletContract.owner()
    //returns the user set as the owner of the smart contract
    console.log("owner: ", _owner)
    

    //outputs the provider
    console.log("provider: ", provider);
  } 

  const sendMoney = async() => {
    try {
      const signer = await getProviderOrSigner(true);
      const walletContract = new Contract(contract_ADDRESS, contract_ABI, signer);
      const tx = await walletContract.sendMoney({value: utils.parseEther("0.001")})
      await tx.wait()
      window.alert("funds sent");

    }catch(err){console.error(err)}
  }

  const getBalance = async() =>{
    try{
      const provider = await getProviderOrSigner();
      const walletContract = new Contract(contract_ADDRESS,contract_ABI,provider);
      const tx = await walletContract.getBalance()
      setContractBalance(tx)
      console.log("tx: ",tx)

    }catch(err){console.log(err)}
  }





  return (
    <div className="App">
    
      {walletConnected ? <div className="userOutput">{user}</div> :
      <div>
        <button onClick={connectWallet} className="btn">Connect Wallet</button>
      </div> 
      
    }
    <div className="accountBalance">
      <p>accountBalance: {accountBalance}</p>
      
    </div>

    {contractBalance}


      <div>
        <button onClick={getOwner} className="btn">Get Owner</button>
      </div>

      <div>
        <button onClick={sendMoney} className="btn">Send Money</button>
      </div>

      <div>
        <button onClick={getBalance} className="btn">getBalance</button>
      </div>
    </div>
  );
}

export default App;
