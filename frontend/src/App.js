import './App.css';
import Swal from 'sweetalert2'
import Web3Modal from 'web3modal'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Navbar from './navbar'
import OwnerNavbar from './ownerNavbar'
import 'react-range-slider-input/dist/style.css';
import { providers, Contract, utils } from "ethers"
import { useRef, useEffect, useState } from "react"
import { contract_ABI, contract_ADDRESS, contract_address_two, contract_abi_two } from '../src/constants'


function App() {
  const web3ModalRef = useRef();
  // bool to track if wallet is connected
  const [walletConnected, setWalletConnected] = useState(false)
  // string holding user address
  const [user, setUser] = useState('')
  // string holding contract balance
  const [contractBalance, setContractBalance] = useState('')
  // string holding connect account balance
  const [accountBalance, setAccountBalance] = useState('')
  // bool
  const [owner, setOwner] = useState(false)
  // string holding owner address
  const [ownerAddress, setOwnerAddress] = useState('')
  // string holding the connected users limit
  const [userLimit, setUserLimit] = useState("")

  // --- SMART CONTRACT VARIABLES ---

  // this gets the number from the range input and set it to state (stakeInput)
  const [stakeOutput, setStakeOutput] = useState(50)
  // this calculates the percent return on the stake
  const [stakeResult, setStakeResult] = useState(50)
  const [duration, setDuration] = useState(0)
  // bool holding if there is currently a stake
  const [isStake, setIsStake] = useState(true)
  // the returned value from the smart contract
  const [SMstakeEnd, setSMstakeEnd] = useState(0)
  // stores the amount of tokens the user owns
  const [tokensOwned, setTokensOwned] = useState(0)


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
      getUserStakeData()
      getTokensOwned()
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
    tx.wait()
    alert('funds withdrawn')
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

  // returns the end date from the smart contract
  async function getUserStakeData() {
    const provider = await getProviderOrSigner()
    const walletContract = new Contract(contract_address_two, contract_abi_two, provider)
    const tx = await walletContract.getStakeUserData(user);
 
    setIsStake(tx.isStake)
    setStakeOutput(tx.stakeAmount.toNumber())
    setStakeResult(tx.stakeTotal.toNumber())
    setSMstakeEnd(tx.stakeEndDate.toNumber() * 1000)
    
    // need to set and get isStake from the smart contract

  }
  

// the functions that runs onClick in stake and starts the countdown in the smart contract
// sets the userStake data
  const SMstartCountdown = async() =>{
    try{
      const signer = await getProviderOrSigner(true)
      const walletContract = new Contract(contract_address_two, contract_abi_two,signer)
      // function takes in duration, the stake amount, _stakeTotal

      // need to find a way to pass in the end amount or i will just have to calculate it in the smart contract
      const tx = await walletContract.setStake(duration, stakeOutput, stakeResult)
      await tx.wait()
      getUserStakeData()
      alert(stakeResult + ' wei' + duration  )
      setIsStake(true)
    }
    catch(err){
      console.log(err)
    }
  }

  const resetStake = async() =>{
    try{
      const signer = await getProviderOrSigner(true);
      const walletContract = new Contract(contract_address_two, contract_abi_two, signer)
      const tx = await walletContract.resetStake()
      await tx.wait()
      alert('stake has been reset')
      getUserStakeData()
    }catch(err){console.log(err)}
  }

  
   // func handles the count down for the stake section and is run every second
  const countdown = setInterval(() => {
    // only runs the countdown calc if there is currently a stake
    var now = new Date().getTime();
    // timeleft = the var from the smart contract - now
    var timeleft = SMstakeEnd - now
    if(isStake && timeleft > 1){
      try{
        // calc the days, hours, mins and secs from the milliseconds
        var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
        var hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);
  
        //outputs the countdown variable to countdown p tag
        // i need to run this only if the stake section is open 
        document.getElementById("countdown").innerHTML = days + "d " 
        + hours + "h " 
        + minutes + "m "
        + seconds + "s" 

      }catch(err){console.log(err)}
      // if timeleft equals zero, will set isStake to false so the user can return to stake screen

    }
    else if(timeleft === 0){
      setIsStake(false)
      console.log('the time for the stake is 0')
    }else{return}
    
  }, 1000)
    

// this func handles changes to inputs in the stake section and 
 const changeStakeOutput = ()=>{
  const number = document.getElementById('stakeInput').value
  // this calls a static radio value.
  // length returns the number from the radio buttons
 var length = 7;

 // radios is an array of all the radios, i then loop through the array and then use an if statement 
 // to if its checked, if it is i assign the value to length
  const radios = document.getElementsByName('rr')
  for(var i = 0, lengths = radios.length; i<lengths; i++){
    if(radios[i].checked){
      length = radios[i].value;
      break;
    }

  }
  // this calculates the percent return
  var interest = 1
  if (length === '186'){
    interest = 70
  }else if(length === '30'){
    interest = 10
  }else if(length ==='7'){
    interest = 1
  }else(radios[0].checked = true)
  const stakeReturn = (number * interest).toFixed(0);
  
  // this gets the number from the range input and set it to state
  setStakeOutput(number)
  // this calculates the percent return on the stake
  setStakeResult(stakeReturn)
  setDuration(length)
 }

 const mint = async() =>{
  const mintAmount = document.getElementById('mintInput').value;
  const signer = await getProviderOrSigner(true)
  const walletContract = new Contract(contract_address_two, contract_abi_two, signer)
  const tx = await walletContract.mint(mintAmount)
  walletContract.events.mintEvent({
    fromBlock: 0 //This should be when you deployed your contract, ideally keep track of this number as you read new blocks
    }, function(error, event){ console.log(event); })
    .on("connected", function(subscriptionId){
        console.log(subscriptionId);
    })
    .on('data', function(event){
        console.log(event); // same results as the optional callback above
    })
    .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        console.log(error)
    });
  tx.wait()
  alert(mintAmount + " MINT COMPLETE")
  getTokensOwned()
 }

 const getTokensOwned = async() =>{
  const provider = await getProviderOrSigner()
  const walletContract = new Contract(contract_address_two, contract_abi_two, provider)
  const tx = await walletContract.getTokensOwned(user)
  setTokensOwned(tx.toNumber())
  alert(tx.toNumber() + ' retrieved tokens')
  console.log(tx.toNumber())
 }



 


  




  function renderOwner(){
    if(user.toLowerCase() === ownerAddress.toLowerCase()){
      return(
        <>
        <BrowserRouter>
          <OwnerNavbar/>
          <Routes>
            <Route  path='/' element ={
               <div className="container owner">
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
            }/>
            <Route path='setAllowance' element={
              <div className=" container owner">
              <h2>Set Allowance</h2>
              <div className='setAllowance'>
                <label htmlFor="setAllowanceAddress">SetAllowanceAddress: </label>
                <input type="text" id="setAllowanceAddress" name="setAllowanceAddress" className = 'txtbox'/>
              </div>
               
              <div>
                <label htmlFor="setAllowanceAmount">SetAllowanceAmount: </label>
                <input type="number" id="setAllowanceAmount" name="setAllowanceAmount" className = 'txtbox'/>
              </div>
                <div>
                  <button className="btn owner-btn" onClick={setAllowance}>setAllowance</button>
                </div>
              </div>
            }/>
            <Route path='sendMoney' element={
                        <div className="container owner">
                        <h2>Send Money</h2>
                          <label htmlFor="sendMoneyInput">Set Amount: </label>
                          <input type="number" id="sendMoneyInput" name="sendMoneyInput" className = 'txtbox'/>
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
                              buttonsStyling: 'true',
                              background: '#6119d6',
                              color: 'white', 
                              padding: '100px',
                              iconColor: 'white',
                              backdrop: 'rgba(220,220,220,0.3)',
                              grow: 'column', 
                              confirmButtonText: 'close',
                              confirmButtonColor: 'yellow'
                            })
                            
                          }}>alert</button>
                      </div>
                      </div>
            }/>

          </Routes>
        </BrowserRouter>
       
        </>
      )
    }
    else{

      return(
        <>
        <BrowserRouter>
        <Navbar/>
        <div className="allInputs">
          <Routes>
            <Route path='/' element ={
               <div className="main container owner ">

               {walletConnected ? <div className="userOutput">{user}</div> :
               <div>
                 <button onClick={connectWallet} className="btn owner-btn">Connect Wallet</button>
               </div> }
     
               <div className="accountBalance ">
                 <p>accountBalance: {accountBalance} ETH</p>
               </div>
     
               {userLimit ? <div>userLimit: {userLimit} wei</div> : <div></div>}
     
               {/* {owner ? <div className="ownerAddress">Owner: {ownerAddress}</div> : <div></div>} */}
               <div>
                 <button onClick={getAllowanceLimit} className="btn owner-btn">getAllowanceLimit</button>
                 {/* <div id="buttonContainer"></div> */}
                 
               </div>
             </div>
            }/>
            <Route path='userWithdraw' element = {
              <div className="withdraw container owner">
              <h3>Withdraw</h3>
                <label htmlFor="name">Amount: </label>
                <input className ='txtbox' type="number" id="amountInput" name="name" />
              <div>
                <button onClick={withdraw} className="btn owner-btn">withdraw</button>
              </div>
            </div>
            }/>
            <Route path='userSendMoney' element = {    <div className="container owner">
                <h3>Send Money</h3>
                <label htmlFor="sendMoneyInput">Set Amount: </label>
                <input className ='txtbox' type="number" id="sendMoneyInput" name="sendMoneyInput"/>
            <div>
                <button onClick={sendMoney} className="btn owner-btn">sendMoney</button>
            </div>
            </div>}/>
            <Route path='stake' element={
            <div className='container owner'>
              <h2> Stake</h2>
              {/* // ternary operator to render output depending whether the user has a stake */}
              { isStake === true ? 
              <div>
                  <h4>You currently have a stake in progress!</h4>
                  <div >
                    <h2 id="countdown">countdown</h2>
                    <h4>till completion</h4>
                    <div>
                      <p>stake: {stakeOutput}</p>
                      <p>return: {stakeResult} Woolong</p>
                    </div>
                  </div>
                  <button className="btn owner-btn" onClick={resetStake}>reset Stake</button>
              </div> : 
              <div>
              <div className="stakeContainer">
                <label htmlFor="stakeInput">Set Amount: </label>
                <input className ='txtbox' type="range" id="stakeInput" name="stakeInput"
                min='0' max='50' step='5'  onChange={changeStakeOutput}/>
                <h3>{stakeOutput}</h3>
              </div>
              <div className='checkbox'>
                  <legend>Set duration: </legend>
                  <div className='radioChoices'>
                    <input type="radio" id="r1" name="rr" value="7" onChange={changeStakeOutput}/>
                    <label htmlFor="r1"><span></span>7Days</label>
                    <input type="radio" id="r2" name="rr" value="30" onChange={changeStakeOutput}/>
                    <label htmlFor="r2"><span></span>1Month</label>
                    <input type="radio" id="r3" name="rr" value="186" onChange={changeStakeOutput}/>
                    <label htmlFor="r3"><span></span>6Months</label>
                  </div>
                  <div className='stakeReturnOuput'>
                    <h3>Return: </h3>
                    <h4>{stakeResult} wei</h4>
                  </div>
                
              </div>

              <button className="btn owner-btn" onClick={SMstartCountdown}>stake</button>
              
              </div>}
              
            </div>}/>

            <Route path = 'mint' element={
              <div className = 'container owner'>
                <h3>Mint</h3>
                <label htmlFor="MintInput">Set Amount: </label>
                <input className ='txtbox' type="number" id="mintInput" name="mintInput"/>
                <p>tokens owned: {tokensOwned}</p>
            <div>
                <button onClick={mint} className="btn owner-btn">Mint</button>
            </div>
              </div>
            }/>
          </Routes>
        </div>
        </BrowserRouter>
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
