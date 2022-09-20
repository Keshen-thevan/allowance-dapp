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
  const [userLimit, setUserLimit] = useState("")

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const accounts = await window.ethereum.request({
      method:"eth_requestAccounts"
    })
    setUser(accounts[0])
    //this gets the account of the current user

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
      getOwner()
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
  }, [walletConnected, contractBalance]);

  const getOwner = async() =>{
    const provider = await getProviderOrSigner();
    const walletContract = new Contract(contract_ADDRESS,contract_ABI, provider);
    const _owner = await walletContract.owner()
    setOwner(true)
    setOwnerAddress(_owner)

  
  } 

  const sendMoney = async() => {
    try {
      //need to get the value to send to the contract
      const sendMoneyAmount = document.getElementById("sendMoneyInput").value
      const signer = await getProviderOrSigner(true);
      const walletContract = new Contract(contract_ADDRESS, contract_ABI, signer);
      const tx = await walletContract.sendMoney({value: sendMoneyAmount})
      await tx.wait()
      window.alert("funds sent");
      document.getElementById("sendMoneyInput").value = '';

    }catch(err){console.error(err)}
  }

  const ownerWithdraw = async() =>{
    try{
      const signer = await getProviderOrSigner(true)
      const walletContract = new Contract(contract_ADDRESS, contract_ABI, signer)
      const tx = walletContract.withdrawOwner()
      await window.alert("funds transfered")
    }catch(err){console.error(err)}
    
  }

  const withdraw = async() => {
    //the function needs a variable for the amount the user wants to send
    //need to create a input to get the amount
    const amount = document.getElementById("amountInput").value
    const signer = await getProviderOrSigner(true)
    const walletContract = new Contract(contract_ADDRESS, contract_ABI,signer)
    const tx = await walletContract.withdraw(amount)
    document.getElementById("amountInput").value = '';
    
  }

  const getBalance = async() =>{
    try{
      const provider = await getProviderOrSigner(true);
      const walletContract = new Contract(contract_ADDRESS,contract_ABI,provider);
      const tx = await walletContract.getBalance()
      const contractBalance = tx.toNumber()
      setContractBalance(contractBalance)

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
    document.getElementById("setAllowanceAmount").value  = ''
    document.getElementById("setAllowanceAddress").value = ''

  }

  const getAllowanceLimit = async() =>{
    const provider = await getProviderOrSigner()
    const walletContract = new Contract(contract_ADDRESS,contract_ABI,provider)
    const tx = await walletContract.getAllowanceLimit(user)
    const limit = tx.toNumber()
    setUserLimit(limit)
    console.log("allowance: ", userLimit)
  }

  function renderOwner(){
    if(user.toLowerCase() == ownerAddress.toLowerCase()){
      return(
        <>
        <div className="interface container owner">

          {walletConnected ? <div className="userOutput">{user}</div> :
          <div>
            <button onClick={connectWallet} className="btn owner-btn">Connect Wallet</button>
          </div> }

          <div className="accountBalance ">
            <p>accountBalance: {accountBalance}</p>
          </div>

          <div>contract Balance: {contractBalance} wei</div>
          <div>
            <button onClick={ownerWithdraw} className="btn owner-btn">ownerWithdraw</button>
            <button onClick={getBalance} className="btn owner-btn">getBalance</button>
            <div id="buttonContainer"></div>
          </div>
        </div>
          {console.log("owner")}

          <div className="setAllowance container owner">
          <h3>Set Allowance</h3>
            <label for="setAllowanceAddress">SetAllowanceAddress: </label>
            <input type="text" id="setAllowanceAddress" name="setAllowanceAddress"/>

            <label for="setAllowanceAmount">SetAllowanceAmount: </label>
            <input type="number" id="setAllowanceAmount" name="setAllowanceAmount"/>
            <div>
              <button className="btn owner-btn" onClick={setAllowance}>setAllowance</button>
            </div>
          </div>
          <div className="container owner">
        <h3>Send Money</h3>
          <label for="sendMoneyInput">Set Amount: </label>
          <input type="number" id="sendMoneyInput" name="sendMoneyInput"/>
        <div>
          <button onClick={sendMoney} className="btn owner-btn">sendMoney</button>
        </div>
      </div>
          
        </>
      )
    }
    else{
      return(
        <>
        <div className="interface container user">

          {walletConnected ? <div className="userOutput">{user}</div> :
          <div>
            <button onClick={connectWallet} className="btn user-btn">Connect Wallet</button>
          </div> }

          <div className="accountBalance ">
            <p>accountBalance: {accountBalance}</p>
          </div>

          <div>contract Balance: {contractBalance} wei</div>
          <div>userLimit: {userLimit} wei</div>

          {owner ? <div className="ownerAddress">Owner: {ownerAddress}</div> : <div></div>}
          <div>
            <button onClick={getBalance} className="btn user-btn">getBalance</button>
            <button onClick={getAllowanceLimit} className="btn user-btn">getAllowanceLimit</button>
            <div id="buttonContainer"></div>
            
          </div>
        </div>
        <div className="allInputs">
            <div className="withdraw container user">
              <h3>Withdraw</h3>
                <label for="name">Amount: </label>
                <input type="number" id="amountInput" name="name" />
              <div>
                <button onClick={withdraw} className="btn user-btn">withdraw</button>
              </div>
            </div>
        </div>
        <div className="container user">
        <h3>Send Money</h3>
          <label for="sendMoneyInput">Set Amount: </label>
          <input type="number" id="sendMoneyInput" name="sendMoneyInput"/>
        <div>
          <button onClick={sendMoney} className="btn user-btn">sendMoney</button>
        </div>
      </div>
        
        </>
      )
      
    }
  }



   
  
  return (
    <div className="App">
        {renderOwner()}
    </div>
  );
}

export default App;
