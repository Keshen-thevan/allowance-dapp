import './App.css';
import Swal from 'sweetalert2'
import Web3Modal, { getProviderInfoFromChecksArray } from 'web3modal'
import {BrowserRouter, Route, Routes, NavLink} from 'react-router-dom';
import Navbar from './navbar'
import OwnerNavbar from './ownerNavbar'
import 'react-range-slider-input/dist/style.css';
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
  const [stakeOutput, setStakeOutput] = useState('50')
  const [stakeResult, setStakeResult] = useState('50')
  const [duration, setDuration] = useState(0)
  const [isStake, setIsStake] = useState(false)
  // const [countDown, setCountDown] = useState()

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



 
  // convert duration into an int
  var durationInt = parseInt(duration)
  // date now, returns value between(1-30)
  var present = new Date().getDate();
  const endDate = new Date()
  // sets var endDate to the new end date by adding the current date plus the duration
  endDate.setDate(present +  durationInt)
  
   // func handles the count down for the stake section and is run every second
  const countdown = setInterval(() => {
    // only runs the countdown calc if there is currently a stake
    if(isStake){
      var now = new Date().getTime();
      var timeleft = endDate.getTime() - now

      // calc the days, hours, mins and secs from the milliseconds
      var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
      var hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

      //outputs the countdown variable to countdown p tag
      document.getElementById("countdown").innerHTML = days + "d " 
      + hours + "h " 
      + minutes + "m "
      + seconds + "s" 
      // if timeleft equals zero, will set isStake to false so the user can return to stake screen
      if(timeleft === 0){
        setIsStake(false)
      }else{return}
    }
    
  }, 1000)
    

  // func runs on button click in stake section
  const getStake = () =>{
    alert(stakeResult + ' wei' + duration)
    setIsStake(true)
  }


  
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
  var interest = 0.01;
  if (length === '186'){
    interest = 0.7;
  }else if(length === '30'){
    interest = 0.1;
  }else if(length ==='7'){
    interest = 0.01
  }else(radios[0].checked = true)
  const stakeReturn = (number * interest).toFixed(1);
  
  // this gets the number from the range input and set it to state
  setStakeOutput(number)
  // this calculates the percent return on the stake
  setStakeResult(stakeReturn)
  setDuration(length)
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
                  <h4>You already have a stake in progress!</h4>
                  <div >
                    <h2 id="countdown"></h2>
                    <h4>till completion</h4>
                    <div>
                      <p>stake: {stakeOutput}</p>
                      <p>return: {stakeResult} Woolong</p>
                    </div>
                  </div>
                 
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

              <button className="btn owner-btn" onClick={getStake}>stake</button>
              </div>}
              


            </div>}/>
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
