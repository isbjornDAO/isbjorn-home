// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.5.0;

import "./SafeMath.sol";
import "./IIcePond.sol";

library IsbjornLibrary {
    using SafeMath for uint256;

    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(
        address tokenA,
        address tokenB
    ) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "IsbjornLibrary: IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token0 != address(0), "IsbjornLibrary: ZERO_ADDRESS");
    }

    // calculates the CREATE2 address for a pair without making any external calls
    function pairFor(
        address factory,
        bool isVolatile,
        address tokenA,
        address tokenB
    ) internal pure returns (address pair) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = address(
            uint256(
                keccak256(
                    abi.encodePacked(
                        hex"ff",
                        factory,
                        keccak256(abi.encodePacked(isVolatile, token0, token1)),
                        hex"65abd014de0dd64bb79d65632e48f271f367c323d4dc2dbb8d01aebba15ce41b"
                    )
                )
            )
        );
    }

    // fetches and sorts the reserves for a pair
    function getReserves(
        address factory,
        bool isVolatile,
        address tokenA,
        address tokenB
    ) internal view returns (uint256 reserveA, uint256 reserveB) {
        (address token0, ) = sortTokens(tokenA, tokenB);
        (uint256 reserve0, uint256 reserve1, ) = IIcePond(
            pairFor(factory, isVolatile, tokenA, tokenB)
        ).getReserves();
        (reserveA, reserveB) = tokenA == token0
            ? (reserve0, reserve1)
            : (reserve1, reserve0);
    }

    // given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
    function quote(
        bool isVolatile,
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) internal pure returns (uint256 amountB) {
        //TODO if not isVolatile
        if (isVolatile) {
            require(amountA > 0, "IsbjornLibrary: INSUFFICIENT_AMOUNT");
            require(
                reserveA > 0 && reserveB > 0,
                "IsbjornLibrary: INSUFFICIENT_LIQUIDITY"
            );
            amountB = amountA.mul(reserveB) / reserveA;
        }
    }

    // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    function getAmountOut(
        bool isVolatile,
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256 amountOut) {
        //TODO if not isVolatile
        if (isVolatile) {
            require(amountIn > 0, "IsbjornLibrary: INSUFFICIENT_INPUT_AMOUNT");
            require(
                reserveIn > 0 && reserveOut > 0,
                "IsbjornLibrary: INSUFFICIENT_LIQUIDITY"
            );
            uint256 amountInWithFee = amountIn.mul(997);
            uint256 numerator = amountInWithFee.mul(reserveOut);
            uint256 denominator = reserveIn.mul(1000).add(amountInWithFee);
            amountOut = numerator / denominator;
        }
    }

    // given an output amount of an asset and pair reserves, returns a required input amount of the other asset
    function getAmountIn(
        bool isVolatile,
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256 amountIn) {
        //TODO if not isVolatile
        if (isVolatile) {
            require(
                amountOut > 0,
                "IsbjornLibrary: INSUFFICIENT_OUTPUT_AMOUNT"
            );
            require(
                reserveIn > 0 && reserveOut > 0,
                "IsbjornLibrary: INSUFFICIENT_LIQUIDITY"
            );
            uint256 numerator = reserveIn.mul(amountOut).mul(1000);
            uint256 denominator = reserveOut.sub(amountOut).mul(997);
            amountIn = (numerator / denominator).add(1);
        }
    }

    // performs chained getAmountOut calculations on any number of pairs
    function getAmountsOut(
        address factory,
        bool isVolatile,
        uint256 amountIn,
        address[] memory path
    ) internal view returns (uint256[] memory amounts) {
        //TODO if not isVolatile
        if (isVolatile) {
            require(path.length >= 2, "IsbjornLibrary: INVALID_PATH");
            amounts = new uint256[](path.length);
            amounts[0] = amountIn;
            for (uint256 i; i < path.length - 1; i++) {
                (uint256 reserveIn, uint256 reserveOut) = getReserves(
                    factory,
                    isVolatile,
                    path[i],
                    path[i + 1]
                );
                amounts[i + 1] = getAmountOut(
                    isVolatile,
                    amounts[i],
                    reserveIn,
                    reserveOut
                );
            }
        }
    }

    // performs chained getAmountIn calculations on any number of pairs
    function getAmountsIn(
        address factory,
        bool isVolatile,
        uint256 amountOut,
        address[] memory path
    ) internal view returns (uint256[] memory amounts) {
        //TODO if not isVolatile
        if (isVolatile) {
            require(path.length >= 2, "IsbjornLibrary: INVALID_PATH");
            amounts = new uint256[](path.length);
            amounts[amounts.length - 1] = amountOut;
            for (uint256 i = path.length - 1; i > 0; i--) {
                (uint256 reserveIn, uint256 reserveOut) = getReserves(
                    factory,
                    isVolatile,
                    path[i - 1],
                    path[i]
                );
                amounts[i - 1] = getAmountIn(
                    isVolatile,
                    amounts[i],
                    reserveIn,
                    reserveOut
                );
            }
        }
    }
}
