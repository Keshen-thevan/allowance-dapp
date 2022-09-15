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

## latest additions:
- the last thing i added the set allowance function. It takes in 2 parameters. all taken in by inputs.

## Things I learnt:
- use the .toNumber() method to convert a big Number from a smart contract and changes it to a readable number for javascript to work with

## next thing to add
- i want to be able to set the amount of eth i want to be able to send to the contract

## Problems
1. only owner can get balance of smart contract, but the balance on the frontend show it it all in lowercase and on smart contract it has uppercase
- solution: i removed the onlyOwner modifier from the function on the smart contract

2. when returning the balance of the smart contract, it returns it in wei, i need it to be in ether