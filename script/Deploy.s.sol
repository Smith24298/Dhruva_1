// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/DIDRegistry.sol";

contract DeployScript is Script {
    function run() external returns (DIDRegistry registry) {
        vm.startBroadcast();
        registry = new DIDRegistry();
        vm.stopBroadcast();
        console.log("DIDRegistry deployed at:", address(registry));
    }
}
