install 
- web3Modal
- ethers

## functions
- setAllowance(_who, _amount)
- setOwner(_address) onlyOwner
- withdrawOwner() onlyOwner
- withdraw(_amount)
- allowance(_address)
- getBalance() onlyOwner
- owner()

current problem
- only owner can get balance of smart contract, but the balance on the frontend show it it all in lowercase and on smart contract it has uppercase