// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC721.sol";
import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./ERC2981.sol";
import "./IERC20.sol";

contract Puppets is ERC721, ERC2981, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 private _tokenId;
    uint256 private _maxSupply = 1000;
    uint96 private _royaltyAmount = 600; // 6% royalties
    uint256 private constant PUBLIC_MINT_LIMIT = 2; // Limit per phase for public minting

    address private _royaltyReceiver = address(0); //set dao address

    bool public revealed = false;
    string private _baseTokenURI = "ipfs://<IPFS_HASH>";
    string private _baseExtension = ".json";
    string private _unrevealURI = "ipfs://<IPFS_HASH>/unrevealed.json";

    bool private _mintActive = true;

    mapping(MintPhase => mapping(address => uint256)) public mintsInPhase;
    mapping(MintPhase => PhaseDetails) public detailsByPhase;
    mapping(address => bool) public whiteList;

    enum MintPhase {
        None,
        WL,
        P1,
        P2,
        P3,
        P4
    }

    struct PhaseDetails {
        uint96 price;
        uint32 startTime;
        uint256 phaseLimit;
    }

    modifier mintCompliance(MintPhase _phase, uint32 _quantity) {
        require(_mintActive, "Minting is not active.");
        require(_quantity > 0, "Must mint at least one");
        require(getCurrentPhase() == _phase, "Incorrect phase");

        PhaseDetails memory phaseDetails = detailsByPhase[_phase];
        require(
            block.timestamp >= phaseDetails.startTime,
            "Mint not started yet!"
        );
        require(
            _tokenId + _quantity <= phaseDetails.phaseLimit,
            "None left in this phase"
        );
        require(
            msg.value == (_quantity * phaseDetails.price),
            "Not enough AVAX sent."
        );

        // Check phase-specific requirements
        if (_phase == MintPhase.WL) {
            require(whiteList[msg.sender], "Not whitelisted");
            require(_quantity == 1, "WL phase limited to 1 mint");
            require(mintsInPhase[_phase][msg.sender] == 0, "Already minted WL");
        } else {
            require(_quantity <= PUBLIC_MINT_LIMIT, "Exceeds phase mint limit");
            require(
                mintsInPhase[_phase][msg.sender] + _quantity <=
                    PUBLIC_MINT_LIMIT,
                "Would exceed phase mint limit"
            );
        }
        _;
    }

    function addToWhitelist(address[] calldata addresses) external onlyOwner {
        for (uint i = 0; i < addresses.length; i++) {
            whiteList[addresses[i]] = true;
        }
    }

    function removeFromWhitelist(
        address[] calldata addresses
    ) external onlyOwner {
        for (uint i = 0; i < addresses.length; i++) {
            whiteList[addresses[i]] = false;
        }
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        _royaltyReceiver = msg.sender;
        _setDefaultRoyalty(msg.sender, _royaltyAmount);
        _internalMint(msg.sender, 250); //200 presale puppets to be manually distributed, 50 kept for treasury
    }

    function initPhases(uint32 _startTime) public onlyOwner {
        setPhaseDetails(MintPhase.WL, 1 ether, _startTime, 400);
        setPhaseDetails(MintPhase.P1, 1.2 ether, _startTime + 10 minutes, 550);
        setPhaseDetails(MintPhase.P2, 1.4 ether, _startTime + 20 minutes, 700);
        setPhaseDetails(MintPhase.P3, 1.6 ether, _startTime + 30 minutes, 850);
        setPhaseDetails(MintPhase.P4, 1.8 ether, _startTime + 40 minutes, 1000);
    }

    function setMintActive(bool status) public onlyOwner {
        _mintActive = status;
    }

    function setPhaseDetails(
        MintPhase _phase,
        uint96 _price,
        uint32 _startTime,
        uint256 _phaseLimit
    ) public onlyOwner {
        detailsByPhase[_phase] = PhaseDetails(_price, _startTime, _phaseLimit);
    }

    function setRoyaltyReceiver(address royaltyReceiver_) public onlyOwner {
        _royaltyReceiver = royaltyReceiver_;
    }

    function setRoyaltyAmount(uint96 royaltyAmount_) public onlyOwner {
        _royaltyAmount = royaltyAmount_;
    }

    function setBaseURI(string calldata baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
    }

    function setUnrevealURI(string calldata unrevealURI) external onlyOwner {
        _unrevealURI = unrevealURI;
    }

    function setBaseExtension(string memory newBaseExtension) public onlyOwner {
        _baseExtension = newBaseExtension;
    }

    function getMaxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setMaxSupply(uint256 maxSupply_) public onlyOwner {
        _maxSupply = maxSupply_;
    }

    function _internalMint(address recipient, uint32 quantity) private {
        for (uint i = 0; i < quantity; i++) {
            _tokenId++;
            _mint(recipient, _tokenId);
        }
    }

    function wlMint() public payable mintCompliance(MintPhase.WL, 1) {
        payable(_royaltyReceiver).transfer(msg.value);
        mintsInPhase[MintPhase.WL][msg.sender] += 1;
        _internalMint(msg.sender, 1);
    }

    function publicMint(
        uint32 quantity,
        MintPhase phase
    ) public payable mintCompliance(phase, quantity) {
        mintsInPhase[phase][msg.sender] += quantity;
        payable(_royaltyReceiver).transfer(msg.value);
        _internalMint(msg.sender, quantity);
    }

    function getCurrentPhase() public view returns (MintPhase) {
        if (block.timestamp < detailsByPhase[MintPhase.WL].startTime) {
            return MintPhase.None;
        }

        if (block.timestamp < detailsByPhase[MintPhase.P1].startTime) {
            return MintPhase.WL;
        }

        if (block.timestamp < detailsByPhase[MintPhase.P2].startTime) {
            return MintPhase.P1;
        }

        if (block.timestamp < detailsByPhase[MintPhase.P3].startTime) {
            return MintPhase.P2;
        }

        if (block.timestamp < detailsByPhase[MintPhase.P4].startTime) {
            return MintPhase.P3;
        }

        return MintPhase.P4;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenId;
    }

    function royaltyInfo(
        uint256 /*_tokenId*/,
        uint256 _salePrice
    ) public view override returns (address receiver, uint256 royaltyAmount) {
        return (_royaltyReceiver, ((_salePrice * _royaltyAmount) / 10000));
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            ownerOf(tokenId) != address(0),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        _baseExtension
                    )
                )
                : _unrevealURI;
    }

    function rescueAvax(uint256 amount) external onlyOwner {
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success);
    }

    function rescueERC20(address tokenAddress) public onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            token.transfer(msg.sender, balance);
        }
    }

    function rescueNFT(address tokenAddress, uint256 tokenId) public onlyOwner {
        ERC721 token = ERC721(tokenAddress);
        require(token.ownerOf(tokenId) == address(this), "doesn't need rescue");
        token.transferFrom(address(this), msg.sender, tokenId);
    }
}
