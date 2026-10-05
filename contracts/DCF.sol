
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract DCF {
    address public owner = msg.sender;

    mapping(address => bool) public authorizedPeople;

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
    function restrictedFunction() public onlyOwner returns (string memory) {
        return "Access granted";
    }
}

