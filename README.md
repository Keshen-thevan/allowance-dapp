install 
- web3Modal
- ethers
- used sweetalert2 for custom popups

## functions
- setAllowance(_who, _amount) <done>
- setOwner(_address) onlyOwner
- withdrawOwner() onlyOwner <done>
- withdraw(_amount) <done>
- allowance(_address) 
- sendFunds() <done>
- getBalance() onlyOwner <done>
    *the contract originally had a onlyOwner modifier on this function, but i changed it to not need owner
- owner() <done>

## Things I learnt:
- use the .toNumber() method to convert a big Number from a smart contract and changes it to a readable number for javascript to work with


## Problems
1. only owner can get balance of smart contract, but the balance on the frontend show it it all in lowercase and on smart contract it has uppercase
- solution: i removed the onlyOwner modifier from the function on the smart contract

2. when returning the balance of the smart contract, it returns it in wei, i need it to be in ether

## features to add
- change the ui to have a sidebar with all the options on the side and have the ui change depending on the what the 
    user selects on the sidebar.
- there would be popups after every transaction to confirm transaction completion
- owner should be able to see a list of all the users and their respective limits
- user should see their limit and amount available(currently the user can contiously withdraw as their limit doesnt decrease after withdraw)
- user should be able to stake and the yield will paid out in a native token
- they would also be able to mint native tokens
- the user should also be able to link a name to their wallet address, this would allow it to show a name and address on the greeting 


- i would like to add more cards for the user, currently there is only 2( withdraw and send money ), if i can add more , then it would be better to implement the sidebar as the nav