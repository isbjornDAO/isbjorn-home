// SPDX-License-Identifier: MIT
pragma solidity =0.6.12;
pragma experimental ABIEncoderV2;

/**
 * @dev Minimal implementation of a soulbound ERC1155 token
 */
contract SoulboundAchievments {
    string private _uri;
    address private _owner;

    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) private _balances;

    // Mapping from token ID to total supply
    mapping(uint256 => uint256) private _totalSupply;

    // Mapping from token ID to URI
    mapping(uint256 => string) private _tokenURIs;

    event TransferSingle(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 id,
        uint256 value
    );

    event URI(string value, uint256 indexed id);

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not owner");
        _;
    }

    constructor(string memory uri_) public {
        _owner = msg.sender;
        _uri = uri_;
    }

    function uri(uint256 tokenId) public view returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];

        // If token-specific URI exists, return it
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }

        // Otherwise return base URI
        return _uri;
    }

    function balanceOf(
        address account,
        uint256 id
    ) public view returns (uint256) {
        require(account != address(0), "Query for zero address");
        return _balances[id][account];
    }

    function balanceOfBatch(
        address[] memory accounts,
        uint256[] memory ids
    ) public view returns (uint256[] memory) {
        require(
            accounts.length == ids.length,
            "Accounts and ids length mismatch"
        );

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }

        return batchBalances;
    }

    function totalSupply(uint256 id) public view returns (uint256) {
        return _totalSupply[id];
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        string memory tokenURI
    ) external onlyOwner {
        require(to != address(0), "Mint to zero address");
        require(amount == 1, "Soulbound: can only mint 1 token");
        require(_balances[id][to] == 0, "Soulbound: account already has token");

        _balances[id][to] += amount;
        _totalSupply[id] += amount;

        if (bytes(tokenURI).length > 0) {
            _tokenURIs[id] = tokenURI;
            emit URI(tokenURI, id);
        }

        emit TransferSingle(msg.sender, address(0), to, id, amount);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        string[] memory uris
    ) external onlyOwner {
        require(to != address(0), "Mint to zero address");
        require(
            ids.length == amounts.length && ids.length == uris.length,
            "Arrays length mismatch"
        );

        for (uint256 i = 0; i < ids.length; i++) {
            require(amounts[i] == 1, "Soulbound: can only mint 1 token");
            require(
                _balances[ids[i]][to] == 0,
                "Soulbound: account already has token"
            );

            _balances[ids[i]][to] += amounts[i];
            _totalSupply[ids[i]] += amounts[i];

            if (bytes(uris[i]).length > 0) {
                _tokenURIs[ids[i]] = uris[i];
                emit URI(uris[i], ids[i]);
            }
        }

        emit TransferBatch(msg.sender, address(0), to, ids, amounts);
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure {
        revert("Soulbound: transfer not allowed");
    }

    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public pure {
        revert("Soulbound: transfer not allowed");
    }

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return
            interfaceId == 0xd9b67a26 || // ERC1155
            interfaceId == 0x01ffc9a7; // ERC165
    }

    event TransferBatch(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] values
    );
}
