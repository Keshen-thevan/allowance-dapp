install 
- web3Modal
- ethers

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
- change the ui to have a sidebar with all the options on the side and have the ui change depending on the what the user
selects on the sidebar.
- user should be able to stake and the yield will paid out in woolong token
- they would also be able to mint woolong tokens