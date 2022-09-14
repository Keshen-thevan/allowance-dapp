install 
- web3Modal
- ethers

## functions
- setAllowance(_who, _amount)
- setOwner(_address) onlyOwner
- withdrawOwner() onlyOwner
- withdraw(_amount)
- allowance(_address)
- sendFunds() <done>
- getBalance() onlyOwner
    *the contract originally had a onlyOwner modifier on this function, but i changed it to not need owner
- owner() <done>

## latest additions:
- the last thing i added was the owner withdraw.

## Things I learnt:
- use the .toNumber() method to convert a big Number from a smart contract and changes it to a readable number for javascript to work with

## next thing to add
- the next function that needs to be added is a withdraw function

## Problems
1. only owner can get balance of smart contract, but the balance on the frontend show it it all in lowercase and on smart contract it has uppercase
- solution: i removed the onlyOwner modifier from the function on the smart contract

2. when returning the balance of the smart contract, it returns it in wei, i need it to be in ether