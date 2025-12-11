// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC721Events {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
}

/**
 * @title NftCollection
 * @dev ERC-721 compatible NFT smart contract with comprehensive automated test coverage
 */
contract NftCollection is IERC721Events {
    // State variables
    string public name;
    string public symbol;
    uint256 public maxSupply;
    uint256 public totalSupply;
    string public baseURI;
    address public owner;
    bool public paused;

    // Mappings
    mapping(uint256 => address) private tokenIdToOwner;
    mapping(address => uint256) private ownerToBalance;
    mapping(uint256 => address) private tokenIdToApproved;
    mapping(address => mapping(address => bool)) private operatorApprovals;
    mapping(uint256 => bool) private tokenExists;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier tokenMustExist(uint256 tokenId) {
        require(tokenExists[tokenId], "Token does not exist");
        _;
    }

    modifier notPaused() {
        require(!paused, "Minting is paused");
        _;
    }

    // Constructor
    constructor(string memory _name, string memory _symbol, uint256 _maxSupply, string memory _baseURI) {
        require(_maxSupply > 0, "Max supply must be greater than 0");
        name = _name;
        symbol = _symbol;
        maxSupply = _maxSupply;
        baseURI = _baseURI;
        owner = msg.sender;
        totalSupply = 0;
        paused = false;
    }

    // ERC-721 standard functions
    function balanceOf(address account) public view returns (uint256) {
        require(account != address(0), "Invalid address");
        return ownerToBalance[account];
    }

    function ownerOf(uint256 tokenId) public view tokenMustExist(tokenId) returns (address) {
        return tokenIdToOwner[tokenId];
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner notPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(!tokenExists[tokenId], "Token already exists");
        require(totalSupply < maxSupply, "Max supply reached");
        require(tokenId > 0 && tokenId <= maxSupply, "Token ID out of range");

        tokenIdToOwner[tokenId] = to;
        ownerToBalance[to]++;
        tokenExists[tokenId] = true;
        totalSupply++;

        emit Transfer(address(0), to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public tokenMustExist(tokenId) {
        require(from != address(0), "Invalid from address");
        require(to != address(0), "Invalid to address");
        require(tokenIdToOwner[tokenId] == from, "From address is not the owner");
        require(
            msg.sender == from || msg.sender == tokenIdToApproved[tokenId] || operatorApprovals[from][msg.sender],
            "Not authorized to transfer"
        );

        // Clear approvals
        if (tokenIdToApproved[tokenId] != address(0)) {
            tokenIdToApproved[tokenId] = address(0);
        }

        // Update ownership and balances
        ownerToBalance[from]--;
        ownerToBalance[to]++;
        tokenIdToOwner[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId, "");
    }

    function approve(address to, uint256 tokenId) public tokenMustExist(tokenId) {
        address tokenOwner = tokenIdToOwner[tokenId];
        require(msg.sender == tokenOwner || operatorApprovals[tokenOwner][msg.sender], "Not authorized to approve");
        require(to != tokenOwner, "Cannot approve to current owner");

        tokenIdToApproved[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Cannot approve yourself");
        operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function getApproved(uint256 tokenId) public view tokenMustExist(tokenId) returns (address) {
        return tokenIdToApproved[tokenId];
    }

    function isApprovedForAll(address tokenOwner, address operator) public view returns (bool) {
        return operatorApprovals[tokenOwner][operator];
    }

    function tokenURI(uint256 tokenId) public view tokenMustExist(tokenId) returns (string memory) {
        return string(abi.encodePacked(baseURI, "/", _uint2str(tokenId), ".json"));
    }

    // Admin functions
    function pause() public onlyOwner {
        paused = true;
    }

    function unpause() public onlyOwner {
        paused = false;
    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }

    // Utility function
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
