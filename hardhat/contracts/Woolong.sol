//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC20/ERC20.sol";

contract Woolong is ERC20{

    mapping(address => uint256) tokensOwned;
    mapping(address => uint256) stakeEndDate;
    mapping(address => StakeUser) stakeUsers; 

//struct containing all the stake details of the user
    struct StakeUser {
        bool isStake;
        uint256 stakeAmount;
        uint256 stakeStartDate;
        uint256 stakeEndDate;
        uint256 stakeTotal;
    }
    
    constructor() ERC20("Woolongs", "Woo"){
        // 1 dollar = 100 cents
        // 1 token = 1 * (10 ** decimals)
        _mint(msg.sender, 100 * 10 ** uint(decimals()));
    }

    function mint(uint256 _amount)external payable{
        tokensOwned[msg.sender] += _amount;
        _mint(msg.sender, _amount);
    }

    // func sets stakeEnd as the end date of the the countdown
    // change the function name to setStake
    function setStake(uint256 _duration, uint256 _amount, uint256 _stakeTotal) external {
        require(stakeUsers[msg.sender].isStake ==  false, "there is currently a stake in progress");
        if(_duration == 7){
            stakeEndDate[msg.sender] = block.timestamp + 7 days;
        }
        else if(_duration == 30){
            stakeEndDate[msg.sender] = block.timestamp + 30 days;
        }
        else{stakeEndDate[msg.sender] = block.timestamp + 186 days;}
        stakeUsers[msg.sender] = StakeUser(true, _amount, block.timestamp, stakeEndDate[msg.sender], _stakeTotal);
    }

// returns a single struct.
    function getStakeUserData(address _user) external view returns(StakeUser memory){
        return stakeUsers[_user];
    }

    function resetStake() external {
        stakeUsers[msg.sender] = StakeUser(false, 0 , 0, 0 , 0);
    }

    function getTokensOwned() external returns(uint256){
        return tokensOwned[msg.sender];
    }

    // this function would be called at the end of the of the stake duration. it takes an amount as a parameter.
    //it requires the mapping to show that the stake is true, and the current block.timestamp to be greater than
    // the stakeEnd date, it the mints the specified amount of tokens and sets the mapping of isStake back to false
    function stakeEnd(uint8 _amount) external{
        require(stakeUsers[msg.sender].isStake == true, "the user does not have a current stake");
        require(block.timestamp >= stakeEndDate[msg.sender], "the stake duration is not complete");
        _mint(msg.sender, _amount);
        stakeUsers[msg.sender].isStake = false;
    }


    receive() external payable{}
    fallback () external payable{}
}