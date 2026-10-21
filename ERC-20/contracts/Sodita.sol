// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Sodita is ERC20 {
    uint constant _initial_supply = 100 * (10**18);

    constructor() ERC20("Sodita", "SOD") {
        _mint(msg.sender, _initial_supply);
    }

    function airdrop(address[] calldata recipients, uint256 percentage) external {
        require(percentage > 0 && percentage <= 100, "Percentage must be between 1 and 100");
        require(recipients.length > 0, "Recipients array cannot be empty");
        
        uint256 userSupply = balanceOf(msg.sender);
        require(userSupply > 0, "You don't have enough tokens");
        uint256 amountToAirdrop = (userSupply * percentage) / 100;
        uint256 amountPerRecipient = amountToAirdrop / recipients.length;

        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amountPerRecipient);
        }
    }
}
