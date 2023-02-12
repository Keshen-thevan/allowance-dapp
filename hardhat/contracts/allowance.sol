// SPDX-License-Identifier: MIT
pragma solidity ^ 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

contract allowanceContract is Ownable{
    mapping( address => uint256 ) allowance;
    uint256 public totalUsers;
    uint256 [] users;

    function addUser(address _user) external{
        user[totalUsers].push(_user);
        totalUsers++;
    }

    function returnUsers() external view returns(address[] memory) {
        return(users);
    }
    function sendMoney()external payable{}

    function withdraw(uint256 _amount) external{
        require(_amount <= allowance[msg.sender], "You have exceeded your limit!");
        (bool sent,) = (msg.sender).call{value: _amount}("");
        require(sent, "failed to withdraw funds.");
    }

    function withdrawOwner() external onlyOwner{
        (bool sent, ) = owner().call{value: address(this).balance}("");
        require(sent, "failed to withdraw all the funds.");
    }

    function setAllowance(address _address, uint256 _limit) external onlyOwner{
         allowance[_address] = _limit;
    }

      function getAllowanceLimit(address _address) public view returns(uint256){
        return allowance[_address];
    }

    function getBalance() external view returns(uint256){
        return address(this).balance;
    }

    receive() external payable{}
    fallback() external payable{}
}
