import './App.css';
import Swal from 'sweetalert2'
import Web3Modal, { getProviderInfoFromChecksArray } from 'web3modal'
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
    if (chainId !== 80001 ) {
      window.alert("Change the network to Mumbai testnet");
      throw new Error("Change network to Mumbai testnet");
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
    console.log('wallet connected')
    try{
      await getProviderOrSigner()
      setWalletConnected(true)
      await getOwner()
    }catch(err){console.error(err)}
  }

  useEffect(() => {
    if (!walletConnected) {

      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected, contractBalance]);

  useEffect(() =>{
    renderOwner()
  },[user])

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
      await tx.wait()
      window.alert("all funds withdrawn")
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
      const _contractBalance = tx.toNumber()
      if(_contractBalance === 0){
        setContractBalance('0')
      }else{setContractBalance(_contractBalance)}
      console.log(_contractBalance)
    }catch(err){console.log(err)}
  }

  const setAllowance = async() =>{
    //need this contract to allow users ot withdraw funds
    //takes in two parameters, an address and an amount
    const allowanceAmount = document.getElementById("setAllowanceAmount").value
    const allowanceAddress = document.getElementById("setAllowanceAddress").value
    const _allowanceAmount = allowanceAmount.toLocaleString()
    const _allowanceAddress = allowanceAddress.toLocaleString()
    const signer = await getProviderOrSigner(true);
    const walletContract = new Contract(contract_ADDRESS, contract_ABI, signer);
    const tx = await walletContract.setAllowance(allowanceAddress, allowanceAmount);
    await tx.wait()
    window.alert("allowance set. \naddress: " + _allowanceAddress + "\namount: " + _allowanceAmount)
    document.getElementById("setAllowanceAmount").value  = ''
    document.getElementById("setAllowanceAddress").value = ''
  }

  const getAllowanceLimit = async() =>{
    const provider = await getProviderOrSigner()
    const walletContract = new Contract(contract_ADDRESS,contract_ABI,provider)
    const tx = await walletContract.getAllowanceLimit(user)
    const limit = tx.toNumber()
    console.log(tx)
    setUserLimit(limit)
    console.log("allowance: ", userLimit)
  }

  

  function renderOwner(){
    if(user.toLowerCase() === ownerAddress.toLowerCase()){
      return(
        <>
        <div className="interface container owner">
        <h2>ADMIN</h2>

          {walletConnected ? <div className="userOutput">{user}</div> :
          <div>
            <button onClick={connectWallet} className="btn owner-btn">Connect Wallet</button>
          </div> }

          <div className="accountBalance ">
            <p>accountBalance: {accountBalance} ETH</p>
          </div>

          {contractBalance? <div>contract Balance: {contractBalance} wei</div> : <div></div>}
          <div>
            <button onClick={ownerWithdraw} className="btn owner-btn">ownerWithdraw</button>
            <span></span>
            <button onClick={getBalance} className="btn owner-btn">getBalance</button>
            <div id="buttonContainer"></div>
          </div>
        </div>

          <div className="setAllowance container owner">
          <h3>Set Allowance</h3>
            <label htmlFor="setAllowanceAddress">SetAllowanceAddress: </label>
            <input type="text" id="setAllowanceAddress" name="setAllowanceAddress" class = 'txtbox'/>

            <label htmlFor="setAllowanceAmount">SetAllowanceAmount: </label>
            <input type="number" id="setAllowanceAmount" name="setAllowanceAmount" class = 'txtbox'/>
            <div>
              <button className="btn owner-btn" onClick={setAllowance}>setAllowance</button>
            </div>
          </div>
          <div className="container owner">
        <h3>Send Money</h3>
          <label htmlFor="sendMoneyInput">Set Amount: </label>
          <input type="number" id="sendMoneyInput" name="sendMoneyInput" class = 'txtbox'/>
        <div>
          <button onClick={sendMoney} className="btn owner-btn">sendMoney</button>
        </div>
        {/* remove when done with alert testing */}
        <div>
          <button className="btn owner-btn" onClick ={()=>{
            const title = 'welcome here'
            Swal.fire({
              title: 'Alert',
              text: `${title}`,
              icon: 'success',
              background: '#6119d6',
              color: 'white', 
              padding: '100px',
              iconColor: 'white',
              backdrop: 'rgba(0,0,123,0.7)',
              grow: 'column', 
              confirmButtonText: 'close',
              confirmButtonColor: '#fc6a03'
            })
            
          }}>alert</button>
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
            <p>accountBalance: {accountBalance} ETH</p>
          </div>

          {userLimit ? <div>userLimit: {userLimit} wei</div> : <div></div>}

          {/* {owner ? <div className="ownerAddress">Owner: {ownerAddress}</div> : <div></div>} */}
          <div>
            <button onClick={getAllowanceLimit} className="btn user-btn">getAllowanceLimit</button>
            <div id="buttonContainer"></div>
            
          </div>
        </div>
        <div className="allInputs">
            <div className="withdraw container user">
              <h3>Withdraw</h3>
                <label for="name">Amount: </label>
                <input className ='txtbox' type="number" id="amountInput" name="name" />
              <div>
                <button onClick={withdraw} className="btn user-btn">withdraw</button>
              </div>
            </div>
        <div className="container user">
        <h3>Send Money</h3>
          <label for="sendMoneyInput">Set Amount: </label>
          <input className ='txtbox' type="number" id="sendMoneyInput" name="sendMoneyInput"/>
        <div>
          <button onClick={sendMoney} className="btn user-btn">sendMoney</button>
        </div>
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
