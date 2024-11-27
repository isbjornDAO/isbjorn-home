// contracts/BytesUtil.sol
// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.6.12;

library BytesUtil {
    function bytesToHexString(
        bytes memory data
    ) internal pure returns (string memory) {
        bytes memory hexString = new bytes(data.length * 2 + 2); // Adding space for "0x"
        hexString[0] = "0";
        hexString[1] = "x";

        for (uint i = 0; i < data.length; i++) {
            uint8 byteValue = uint8(data[i]);
            hexString[2 + i * 2] = byteToChar(byteValue / 16); // High nibble
            hexString[3 + i * 2] = byteToChar(byteValue % 16); // Low nibble
        }

        return string(hexString);
    }

    function byteToChar(uint8 value) internal pure returns (bytes1) {
        if (value < 10) {
            return bytes1(value + 48); // ASCII '0' to '9'
        } else {
            return bytes1(value + 87); // ASCII 'a' to 'f'
        }
    }
}
