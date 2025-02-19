// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Puppets.sol";

contract PuppetsFactory {
    event ContractDeployed(address indexed contractAddress, bytes32 salt);

    function deployPuppets(bytes32 salt) external returns (address) {
        address puppetsAddress;
        bytes memory bytecode = abi.encodePacked(type(Puppets).creationCode);

        assembly {
            puppetsAddress := create2(
                0,
                add(bytecode, 0x20),
                mload(bytecode),
                salt
            )
            if iszero(extcodesize(puppetsAddress)) {
                revert(0, 0)
            }
        }

        emit ContractDeployed(puppetsAddress, salt);
        return puppetsAddress;
    }

    function getPuppetsBytecodeHash() external pure returns (bytes32) {
        return keccak256(type(Puppets).creationCode);
    }

    function getPuppetsAddress(bytes32 salt) external view returns (address) {
        bytes memory bytecode = abi.encodePacked(type(Puppets).creationCode);

        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );

        return address(uint160(uint256(hash)));
    }
}
