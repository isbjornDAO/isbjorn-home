// SPDX-License-Identifier: MIT
pragma solidity =0.6.12;

/**
 * @dev Minimal implementation of a soulbound NFT
 */
contract SoulboundNFT {
    string private _name;

    string private _symbol;

    mapping(uint256 => address) private _owners;

    mapping(address => uint256) private _balances;

    mapping(uint256 => string) private _tokenURIs;

    uint256 private _tokenIdCounter;

    address private _owner;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not owner");
        _;
    }

    constructor(string memory name_, string memory symbol_) public {
        _name = name_;
        _symbol = symbol_;
        _owner = msg.sender;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function balanceOf(address account) public view returns (uint256) {
        require(account != address(0), "Query for zero address");
        return _balances[account];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token doesn't exist");
        return owner;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token doesn't exist");
        return _tokenURIs[tokenId];
    }

    function mint(
        address to,
        string memory uri
    ) external onlyOwner returns (uint256) {
        require(to != address(0), "Mint to zero address");

        uint256 tokenId = _tokenIdCounter + 1;
        _tokenIdCounter = tokenId;

        _balances[to] += 1;
        _owners[tokenId] = to;
        _tokenURIs[tokenId] = uri;

        emit Transfer(address(0), to, tokenId);
        emit Minted(to, tokenId, uri);

        return tokenId;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return
            interfaceId == 0x80ac58cd || // ERC721
            interfaceId == 0x01ffc9a7; // ERC165
    }

    function transferFrom(address, address, uint256) public pure {
        revert("Soulbound: transfer not allowed");
    }

    function safeTransferFrom(address, address, uint256) public pure {
        revert("Soulbound: transfer not allowed");
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure {
        revert("Soulbound: transfer not allowed");
    }
}
