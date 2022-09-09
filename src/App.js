import './App.css';
import Web3Modal from 'web3modal'
import { providers, Contract, utils } from "ethers"
import { useRef, useEffect, useState } from "react"
import { contract_ABI, contract_ADDRESS } from '../src/constants'


function App() {
  const web3ModalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false)
  const [user, setUser] = useState('')

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const accounts = await window.ethereum.request({
      method:"eth_requestAccounts"
    })
    setUser(accounts[0])
    console.log("connected account: ", accounts[0])

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
  }, [walletConnected]);

  const getOwner = async() =>{
    const provider = await getProviderOrSigner();
    const walletContract = new Contract( contract_ADDRESS,contract_ABI, provider);
    const _owner = await walletContract.owner()
    console.log("owner: ", _owner)
  } 





  return (
    <div className="App">
    
      {walletConnected ? <div className="userOutput">{user}</div> :
      <div>
        <button onClick={connectWallet} className="btn">Connect Wallet</button>
      </div> 
      
    }


      <div>
        <button onClick={getOwner} className="btn">Get Owner</button>
      </div>
    </div>
  );
}

export default App;
