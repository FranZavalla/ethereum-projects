// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Faucet {
  address payable public owner;
  bool public isActive = true;

  constructor() payable {
    owner = payable(msg.sender);
  }
  
  function withdraw(uint _amount) payable public {
    require(isActive, "Faucet is not active");
    // users can only withdraw .1 ETH at a time, feel free to change this!
    require(_amount <= 100000000000000000);
    (bool sent, ) = payable(msg.sender).call{value: _amount}("");
    require(sent, "Failed to send Ether");
  }

  function withdrawAll() onlyOwner public {
    require(isActive, "Faucet is not active");
    (bool sent, ) = owner.call{value: address(this).balance}("");
    require(sent, "Failed to send Ether");
    isActive = false;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }
}