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
  const [owner, setOwner] = useState(false)
  const [ownerAddress, setOwnerAddress] = useState('')

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
    //divides the number in wei to ether
    const number = balance / 10 ** 18
    //sets the number to show 4 digits after the decimal
    const userBalance = number.toFixed(4)
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

    if(provider){
      console.log("user Connected")
      setWalletConnected(true)
    }else{setWalletConnected(false)}

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
    const walletContract = new Contract(contract_ADDRESS,contract_ABI, provider);
    const _owner = await walletContract.owner()
    setOwner(true)
    setOwnerAddress(_owner)
    //returns the user set as the owner of the smart contract
    console.log("owner: ", _owner)
  
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

  const ownerWithdraw = async() =>{
    try{
      const signer = await getProviderOrSigner(true)
      const walletContract = new Contract(contract_ADDRESS, contract_ABI, signer)
      const tx = walletContract.withdrawOwner()
      window.alert("funds transfered")
    }catch(err){console.error(err)}
    
  }

  const withdraw = async() => {
    //the function needs a variable for the amount the user wants to send
    //need to create a input to get the amount
    const amount = document.getElementById("amountInput").value
    const signer = await getProviderOrSigner(true)
    const walletContract = new Contract(contract_ADDRESS, contract_ABI,signer)
    const tx = await walletContract.withdraw(amount)
    console.log(amount)
    
  }

  const getBalance = async() =>{
    try{
      const provider = await getProviderOrSigner(true);
      const walletContract = new Contract(contract_ADDRESS,contract_ABI,provider);
      const tx = await walletContract.getBalance()
      const contractBalance = tx.toNumber()
      setContractBalance(contractBalance)
      console.log("contractBalance: ",contractBalance)

    }catch(err){console.log(err)}
  }

  const setAllowance = async() =>{
    //need this contract to allow users ot withdraw funds
    //takes in two parameters, an address and an amount
    const allowanceAmount = document.getElementById("setAllowanceAmount").value
    const allowanceAddress = document.getElementById("setAllowanceAddress").value
    const signer = await getProviderOrSigner(true);
    const walletContract = new Contract(contract_ADDRESS, contract_ABI, signer);
    const tx = walletContract.setAllowance(allowanceAddress, allowanceAmount);
    window.alert("allowance set. address: ", allowanceAddress, "amount: ", allowanceAmount)

  }





  return (
    <div className="App">
    
      {walletConnected ? <div className="userOutput">{user}</div> :
      <div>
        <button onClick={connectWallet} className="btn">Connect Wallet</button>
      </div> }

    <div className="accountBalance ">
      <p>accountBalance: {accountBalance}</p>
    </div>

    <div>contract Balance: {contractBalance} wei</div>
    
    {owner ? <div className="ownerAddress">Owner: {ownerAddress}</div> : <div></div>}

    <div className="accountBalance container">
      <label for="name">Amount: </label>
      <input type="number" id="amountInput" name="name" />
      <button onClick={withdraw} className="btn">withdraw</button>
    </div>

    <div className="setAllowance container">
      <label for="setAllowanceAddress">SetAllowanceAddress: </label>
      <input type="text" id="setAllowanceAddress" name="setAllowanceAddress"/>

      <label for="setAllowanceAmount">SetAllowanceAmount: </label>
      <input type="number" id="setAllowanceAmount" name="setAllowanceAmount"/>
      <div>
        <button className="btn" onClick={setAllowance}>setAllowance</button>
      </div>
    </div>

      <div>
        <button onClick={ownerWithdraw} className="btn">Owner Withdraw</button>
      </div>

      <div>
        <button onClick={sendMoney} className="btn">Send Money</button>
      </div>

      <div>
        <button onClick={getOwner} className="btn">Get Owner</button>
        <button onClick={getBalance} className="btn">getBalance</button>
      </div>
    </div>
  );
}

export default App;
