
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract DCF {
    // Contract owner
    address public owner = msg.sender;

    // Access control
    mapping(address => bool) public authorizedPeople;

    // Deposit tracking: address => amount deposited in wei
    mapping(address => uint256) public depositedAmounts;

    // Total deposited through the deposit function
    uint256 public totalDeposited;

    // Only owner can call functions using this modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // Only owner can add a person
    function addPerson(address person) public onlyOwner {
        authorizedPeople[person] = true;
    }

    // Only owner can remove a person
    function removePerson(address person) public onlyOwner {
        authorizedPeople[person] = false;
    }

    // Check whether a person is authorized
    function isAuthorized(address person) public view returns (bool) {
        return authorizedPeople[person];
    }

    // Only owner can use this function
    function restrictedFunction()
        public
        view
        onlyOwner
        returns (string memory)
    {
        return "Access granted";
    }

    // Owner and authorized members can deposit ETH
    function deposit() public payable {
        require(
            msg.sender == owner || authorizedPeople[msg.sender],
            "Not allowed to deposit"
        );

        require(msg.value > 0, "Amount must be greater than zero");

        depositedAmounts[msg.sender] += msg.value;
        totalDeposited += msg.value;
    }

    // Get the caller's total deposits
    function getMyDeposits() public view returns (uint256) {
        return depositedAmounts[msg.sender];
    }

    // Get the total deposits of all users
    function getTotalDeposited() public view returns (uint256) {
        return totalDeposited;
    }

    // Get the contract's current ETH balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Get the total deposits of a particular address
    function getDepositsOf(address person)
        public
        view
        returns (uint256)
    {
        return depositedAmounts[person];
    }
}
