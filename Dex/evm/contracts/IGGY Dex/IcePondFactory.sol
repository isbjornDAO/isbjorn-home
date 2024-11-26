// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.6.12;

import "./IIcePondFactory.sol";
import "./IcePond.sol";
import "./BytesUtil.sol";

contract IcePondFactory is IIcePondFactory {
    address public override feeTo;
    address public override feeToSetter;
    address public override migrator;

    mapping(bool => mapping(address => mapping(address => address)))
        public
        override getPair;
    address[] public override allPairs;

    event PairCreated(
        address indexed token0,
        address indexed token1,
        address pair,
        uint256
    );

    constructor(address _feeToSetter) public {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view override returns (uint256) {
        return allPairs.length;
    }

    function pairCodeHash() external pure returns (bytes32) {
        return keccak256(type(IcePond).creationCode);
    }

    function createPair(
        bool isVolatile,
        address tokenA,
        address tokenB
    ) external override returns (address pair) {
        require(tokenA != tokenB, "Isbjorn: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token0 != address(0), "Isbjorn: ZERO_ADDRESS");
        require(
            getPair[isVolatile][token0][token1] == address(0),
            "Isbjorn: PAIR_EXISTS"
        ); // single check is sufficient
        bytes memory bytecode = type(IcePond).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(isVolatile, token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IcePond(pair).initialize(isVolatile, token0, token1);
        getPair[isVolatile][token0][token1] = pair;
        getPair[isVolatile][token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
        emit PairCreated(isVolatile, token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external override {
        require(msg.sender == feeToSetter, "Isbjorn: FORBIDDEN");
        feeTo = _feeTo;
    }

    function setMigrator(address _migrator) external override {
        require(msg.sender == feeToSetter, "Isbjorn: FORBIDDEN");
        migrator = _migrator;
    }

    function setFeeToSetter(address _feeToSetter) external override {
        require(msg.sender == feeToSetter, "Isbjorn: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }
}
