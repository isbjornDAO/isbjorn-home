// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.6.12;

import "./IIsbjornRouter02.sol";
import "./SafeMath.sol";
import "./IIcePondFactory.sol";
import "./IsbjornLibrary.sol";
import "./TransferHelper.sol";
import "./IWAVAX.sol";
import "./IERC20.sol";

contract IsbjornRouter02 is IIsbjornRouter02 {
    using SafeMath for uint256;

    address public immutable override factory;
    address public immutable override WAVAX;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "IsbjornRouter: EXPIRED");
        _;
    }

    constructor(address _factory, address _WAVAX) public {
        factory = _factory;
        WAVAX = _WAVAX;
    }

    receive() external payable {
        assert(msg.sender == WAVAX); // only accept AVAX via fallback from the WAVAX contract
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        bool isVolatile,
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal virtual returns (uint256 amountA, uint256 amountB) {
        // create the pair if it doesn't exist yet
        if (
            IIcePondFactory(factory).getPair(isVolatile, tokenA, tokenB) ==
            address(0)
        ) {
            IIcePondFactory(factory).createPair(isVolatile, tokenA, tokenB);
        }
        (uint256 reserveA, uint256 reserveB) = IsbjornLibrary.getReserves(
            factory,
            isVolatile,
            tokenA,
            tokenB
        );
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = IsbjornLibrary.quote(
                isVolatile,
                amountADesired,
                reserveA,
                reserveB
            );
            if (amountBOptimal <= amountBDesired) {
                require(
                    amountBOptimal >= amountBMin,
                    "IsbjornRouter: INSUFFICIENT_B_AMOUNT"
                );
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = IsbjornLibrary.quote(
                    isVolatile,
                    amountBDesired,
                    reserveB,
                    reserveA
                );
                assert(amountAOptimal <= amountADesired);
                require(
                    amountAOptimal >= amountAMin,
                    "IsbjornRouter: INSUFFICIENT_A_AMOUNT"
                );
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function addLiquidity(
        bool isVolatile,
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        virtual
        override
        ensure(deadline)
        returns (uint256 amountA, uint256 amountB, uint256 liquidity)
    {
        (amountA, amountB) = _addLiquidity(
            isVolatile,
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
        address pair = IsbjornLibrary.pairFor(
            factory,
            isVolatile,
            tokenA,
            tokenB
        );
        TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
        TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = IIcePond(pair).mint(to);
    }

    function addLiquidityAVAX(
        bool isVolatile,
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountAVAXMin,
        address to,
        uint256 deadline
    )
        external
        payable
        virtual
        override
        ensure(deadline)
        returns (uint256 amountToken, uint256 amountAVAX, uint256 liquidity)
    {
        (amountToken, amountAVAX) = _addLiquidity(
            isVolatile,
            token,
            WAVAX,
            amountTokenDesired,
            msg.value,
            amountTokenMin,
            amountAVAXMin
        );
        address pair = IsbjornLibrary.pairFor(
            factory,
            isVolatile,
            token,
            WAVAX
        );
        TransferHelper.safeTransferFrom(token, msg.sender, pair, amountToken);
        IWAVAX(WAVAX).deposit{value: amountAVAX}();
        assert(IWAVAX(WAVAX).transfer(pair, amountAVAX));
        liquidity = IIcePond(pair).mint(to);
        // refund dust eth, if any
        if (msg.value > amountAVAX)
            TransferHelper.safeTransferAVAX(msg.sender, msg.value - amountAVAX);
    }

    // **** REMOVE LIQUIDITY ****
    function removeLiquidity(
        bool isVolatile,
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        public
        virtual
        override
        ensure(deadline)
        returns (uint256 amountA, uint256 amountB)
    {
        address pair = IsbjornLibrary.pairFor(
            factory,
            isVolatile,
            tokenA,
            tokenB
        );
        IIcePond(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
        (uint256 amount0, uint256 amount1) = IIcePond(pair).burn(to);
        (address token0, ) = IsbjornLibrary.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0
            ? (amount0, amount1)
            : (amount1, amount0);
        require(amountA >= amountAMin, "IsbjornRouter: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "IsbjornRouter: INSUFFICIENT_B_AMOUNT");
    }

    function removeLiquidityAVAX(
        bool isVolatile,
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountAVAXMin,
        address to,
        uint256 deadline
    )
        public
        virtual
        override
        ensure(deadline)
        returns (uint256 amountToken, uint256 amountAVAX)
    {
        (amountToken, amountAVAX) = removeLiquidity(
            isVolatile,
            token,
            WAVAX,
            liquidity,
            amountTokenMin,
            amountAVAXMin,
            address(this),
            deadline
        );
        TransferHelper.safeTransfer(token, to, amountToken);
        IWAVAX(WAVAX).withdraw(amountAVAX);
        TransferHelper.safeTransferAVAX(to, amountAVAX);
    }

    // **** REMOVE LIQUIDITY (supporting fee-on-transfer tokens) ****
    function removeLiquidityAVAXSupportingFeeOnTransferTokens(
        bool isVolatile,
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountAVAXMin,
        address to,
        uint256 deadline
    ) public virtual override ensure(deadline) returns (uint256 amountAVAX) {
        (, amountAVAX) = removeLiquidity(
            isVolatile,
            token,
            WAVAX,
            liquidity,
            amountTokenMin,
            amountAVAXMin,
            address(this),
            deadline
        );
        TransferHelper.safeTransfer(
            token,
            to,
            IERC20(token).balanceOf(address(this))
        );
        IWAVAX(WAVAX).withdraw(amountAVAX);
        TransferHelper.safeTransferAVAX(to, amountAVAX);
    }

    function removeLiquidityAVAXWithPermitSupportingFeeOnTransferTokens(
        bool isVolatile,
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountAVAXMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external virtual override returns (uint256 amountAVAX) {
        address pair = IsbjornLibrary.pairFor(
            factory,
            isVolatile,
            token,
            WAVAX
        );
        uint256 value = approveMax ? uint256(-1) : liquidity;
        IIcePond(pair).permit(
            msg.sender,
            address(this),
            value,
            deadline,
            v,
            r,
            s
        );
        amountAVAX = removeLiquidityAVAXSupportingFeeOnTransferTokens(
            isVolatile,
            token,
            liquidity,
            amountTokenMin,
            amountAVAXMin,
            to,
            deadline
        );
    }

    // **** SWAP ****
    // requires the initial amount to have already been sent to the first pair
    function _swap(
        bool isVolatile,
        uint256[] memory amounts,
        address[] memory path,
        address _to
    ) internal virtual {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = IsbjornLibrary.sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOut)
                : (amountOut, uint256(0));
            address to = i < path.length - 2
                ? IsbjornLibrary.pairFor(
                    factory,
                    isVolatile,
                    output,
                    path[i + 2]
                )
                : _to;
            IIcePond(IsbjornLibrary.pairFor(factory, isVolatile, input, output))
                .swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }

    function swapExactTokensForTokens(
        bool isVolatile,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        amounts = IsbjornLibrary.getAmountsOut(
            factory,
            isVolatile,
            amountIn,
            path
        );
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "IsbjornRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            IsbjornLibrary.pairFor(factory, isVolatile, path[0], path[1]),
            amounts[0]
        );
        _swap(isVolatile, amounts, path, to);
    }

    function swapTokensForExactTokens(
        bool isVolatile,
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        amounts = IsbjornLibrary.getAmountsIn(
            factory,
            isVolatile,
            amountOut,
            path
        );
        require(
            amounts[0] <= amountInMax,
            "IsbjornRouter: EXCESSIVE_INPUT_AMOUNT"
        );
        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            IsbjornLibrary.pairFor(factory, isVolatile, path[0], path[1]),
            amounts[0]
        );
        _swap(isVolatile, amounts, path, to);
    }

    function swapExactAVAXForTokens(
        bool isVolatile,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        payable
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        require(path[0] == WAVAX, "IsbjornRouter: INVALID_PATH");
        amounts = IsbjornLibrary.getAmountsOut(
            factory,
            isVolatile,
            msg.value,
            path
        );
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "IsbjornRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        IWAVAX(WAVAX).deposit{value: amounts[0]}();
        assert(
            IWAVAX(WAVAX).transfer(
                IsbjornLibrary.pairFor(factory, isVolatile, path[0], path[1]),
                amounts[0]
            )
        );
        _swap(isVolatile, amounts, path, to);
    }

    function swapTokensForExactAVAX(
        bool isVolatile,
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        require(path[path.length - 1] == WAVAX, "IsbjornRouter: INVALID_PATH");
        amounts = IsbjornLibrary.getAmountsIn(
            factory,
            isVolatile,
            amountOut,
            path
        );
        require(
            amounts[0] <= amountInMax,
            "IsbjornRouter: EXCESSIVE_INPUT_AMOUNT"
        );
        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            IsbjornLibrary.pairFor(factory, isVolatile, path[0], path[1]),
            amounts[0]
        );
        _swap(isVolatile, amounts, path, address(this));
        IWAVAX(WAVAX).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferAVAX(to, amounts[amounts.length - 1]);
    }

    function swapExactTokensForAVAX(
        bool isVolatile,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        require(path[path.length - 1] == WAVAX, "IsbjornRouter: INVALID_PATH");
        amounts = IsbjornLibrary.getAmountsOut(
            factory,
            isVolatile,
            amountIn,
            path
        );
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "IsbjornRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            IsbjornLibrary.pairFor(factory, isVolatile, path[0], path[1]),
            amounts[0]
        );
        _swap(isVolatile, amounts, path, address(this));
        IWAVAX(WAVAX).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferAVAX(to, amounts[amounts.length - 1]);
    }

    function swapAVAXForExactTokens(
        bool isVolatile,
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        payable
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        require(path[0] == WAVAX, "IsbjornRouter: INVALID_PATH");
        amounts = IsbjornLibrary.getAmountsIn(
            factory,
            isVolatile,
            amountOut,
            path
        );
        require(
            amounts[0] <= msg.value,
            "IsbjornRouter: EXCESSIVE_INPUT_AMOUNT"
        );
        IWAVAX(WAVAX).deposit{value: amounts[0]}();
        assert(
            IWAVAX(WAVAX).transfer(
                IsbjornLibrary.pairFor(factory, isVolatile, path[0], path[1]),
                amounts[0]
            )
        );
        _swap(isVolatile, amounts, path, to);
        // refund dust eth, if any
        if (msg.value > amounts[0])
            TransferHelper.safeTransferAVAX(msg.sender, msg.value - amounts[0]);
    }

    // **** SWAP (supporting fee-on-transfer tokens) ****
    // requires the initial amount to have already been sent to the first pair
    function _swapSupportingFeeOnTransferTokens(
        bool isVolatile,
        address[] memory path,
        address _to
    ) internal virtual {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = IsbjornLibrary.sortTokens(input, output);
            IIcePond pair = IIcePond(
                IsbjornLibrary.pairFor(factory, isVolatile, input, output)
            );
            uint256 amountInput;
            uint256 amountOutput;
            {
                // scope to avoid stack too deep errors
                (uint256 reserve0, uint256 reserve1, ) = pair.getReserves();
                (uint256 reserveInput, uint256 reserveOutput) = input == token0
                    ? (reserve0, reserve1)
                    : (reserve1, reserve0);
                amountInput = IERC20(input).balanceOf(address(pair)).sub(
                    reserveInput
                );
                amountOutput = IsbjornLibrary.getAmountOut(
                    isVolatile,
                    amountInput,
                    reserveInput,
                    reserveOutput
                );
            }
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOutput)
                : (amountOutput, uint256(0));
            address to = i < path.length - 2
                ? IsbjornLibrary.pairFor(
                    factory,
                    isVolatile,
                    output,
                    path[i + 2]
                )
                : _to;
            pair.swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        bool isVolatile,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) {
        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            IsbjornLibrary.pairFor(factory, isVolatile, path[0], path[1]),
            amountIn
        );
        uint256 balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
        _swapSupportingFeeOnTransferTokens(isVolatile, path, to);
        require(
            IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >=
                amountOutMin,
            "IsbjornRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );
    }

    function swapExactAVAXForTokensSupportingFeeOnTransferTokens(
        bool isVolatile,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable virtual override ensure(deadline) {
        require(path[0] == WAVAX, "IsbjornRouter: INVALID_PATH");
        uint256 amountIn = msg.value;
        IWAVAX(WAVAX).deposit{value: amountIn}();
        assert(
            IWAVAX(WAVAX).transfer(
                IsbjornLibrary.pairFor(factory, isVolatile, path[0], path[1]),
                amountIn
            )
        );
        uint256 balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
        _swapSupportingFeeOnTransferTokens(isVolatile, path, to);
        require(
            IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >=
                amountOutMin,
            "IsbjornRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );
    }

    function swapExactTokensForAVAXSupportingFeeOnTransferTokens(
        bool isVolatile,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) {
        require(path[path.length - 1] == WAVAX, "IsbjornRouter: INVALID_PATH");
        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            IsbjornLibrary.pairFor(factory, isVolatile, path[0], path[1]),
            amountIn
        );
        _swapSupportingFeeOnTransferTokens(isVolatile, path, address(this));
        uint256 amountOut = IERC20(WAVAX).balanceOf(address(this));
        require(
            amountOut >= amountOutMin,
            "IsbjornRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        IWAVAX(WAVAX).withdraw(amountOut);
        TransferHelper.safeTransferAVAX(to, amountOut);
    }

    // **** LIBRARY FUNCTIONS ****
    function pairFor(
        bool isVolatile,
        address tokenA,
        address tokenB
    ) public view returns (address) {
        return IsbjornLibrary.pairFor(factory, isVolatile, tokenA, tokenB);
    }

    function quote(
        bool isVolatile,
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) public pure virtual override returns (uint256 amountB) {
        return IsbjornLibrary.quote(isVolatile, amountA, reserveA, reserveB);
    }

    function getAmountOut(
        bool isVolatile,
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure virtual override returns (uint256 amountOut) {
        return
            IsbjornLibrary.getAmountOut(
                isVolatile,
                amountIn,
                reserveIn,
                reserveOut
            );
    }

    function getAmountIn(
        bool isVolatile,
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure virtual override returns (uint256 amountIn) {
        return
            IsbjornLibrary.getAmountIn(
                isVolatile,
                amountOut,
                reserveIn,
                reserveOut
            );
    }

    function getAmountsOut(
        bool isVolatile,
        uint256 amountIn,
        address[] memory path
    ) public view virtual override returns (uint256[] memory amounts) {
        return
            IsbjornLibrary.getAmountsOut(factory, isVolatile, amountIn, path);
    }

    function getAmountsIn(
        bool isVolatile,
        uint256 amountOut,
        address[] memory path
    ) public view virtual override returns (uint256[] memory amounts) {
        return
            IsbjornLibrary.getAmountsIn(factory, isVolatile, amountOut, path);
    }
}
