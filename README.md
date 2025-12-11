# nft-collection-erc721

ERC-721 compatible NFT smart contract with comprehensive automated test suite and Docker containerization.

## Overview

This project implements a fully functional ERC-721 compliant NFT smart contract written in Solidity. It includes complete minting, transferring, and approval functionality along with a comprehensive automated test suite using Hardhat and Chai.

## Features

- **ERC-721 Compliance**: Implements all core ERC-721 standard functions
- **Minting**: Owner-only minting with maximum supply enforcement
- **Transfers**: Safe transfer functionality with proper ownership validation
- **Approvals**: Both single-token approvals and operator-level approvals
- **Metadata**: Token URI support for NFT metadata
- **Access Control**: Owner-based access control for privileged operations
- **Pause Mechanism**: Ability to pause/unpause minting
- **Comprehensive Tests**: 40+ automated tests covering all functionality
- **Docker Support**: Complete containerization for easy testing

## Project Structure

```
nft-collection-erc721/
├── contracts/
│   └── NftCollection.sol          # Main ERC-721 contract
├── test/
│   └── NftCollection.test.js      # Comprehensive test suite
├── package.json                   # NPM dependencies and scripts
├── hardhat.config.js              # Hardhat configuration
├── Dockerfile                     # Docker configuration
├── .dockerignore                  # Docker ignore file
└── README.md                      # This file
```

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Docker (for containerized testing)

## Installation

### Local Setup

```bash
# Clone the repository
git clone https://github.com/nnssprasad97/nft-collection-erc721.git
cd nft-collection-erc721

# Install dependencies
npm install

# Compile contracts
npx hardhat compile
```

## Testing

### Local Testing

```bash
# Run the full test suite
npm test

# Run tests with verbose output
npx hardhat test --verbose
```

### Docker Testing

```bash
# Build the Docker image
docker build -t nft-contract .

# Run tests in Docker container
docker run nft-contract
```

## Smart Contract Functions

### Core ERC-721 Functions

- `balanceOf(address)` - Returns token balance of an address
- `ownerOf(uint256)` - Returns owner of a specific token
- `transferFrom(address, address, uint256)` - Transfer token between addresses
- `safeTransferFrom(address, address, uint256)` - Safe transfer with data parameter
- `approve(address, uint256)` - Approve an address to transfer a token
- `setApprovalForAll(address, bool)` - Set operator approval for all tokens
- `getApproved(uint256)` - Get approved address for a token
- `isApprovedForAll(address, address)` - Check operator approval status

### Admin Functions

- `safeMint(address, uint256)` - Mint new token (owner only)
- `pause()` - Pause minting (owner only)
- `unpause()` - Unpause minting (owner only)
- `setBaseURI(string)` - Update base URI (owner only)

### View Functions

- `tokenURI(uint256)` - Returns metadata URI for a token
- `name()` - Returns contract name
- `symbol()` - Returns contract symbol
- `maxSupply` - Maximum number of tokens
- `totalSupply` - Current number of minted tokens

## Test Coverage

The test suite includes 40+ tests organized into the following categories:

- **Deployment**: Initial state and owner validation
- **Minting**: Successful mints, authorization checks, supply limits
- **Transfers**: Token transfers, balance updates, authorization
- **Approvals**: Single-token approvals and revocation
- **Operator Approvals**: Operator-level approval for multiple tokens
- **Metadata**: Token URI retrieval and validation
- **Pause/Unpause**: Minting pause functionality
- **Balance**: Balance queries and validation
- **Edge Cases**: Invalid operations, zero addresses, token existence

## Configuration

### Solidity Version

```solidity
pragma solidity ^0.8.20;
```

### Hardhat Configuration

```javascript
solidity: {
  version: "0.8.20",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
```

## Usage Example

```javascript
const NftCollection = await ethers.getContractFactory("NftCollection");
const nft = await NftCollection.deploy(
  "MyNFT",                          // name
  "MNFT",                           // symbol
  1000,                             // maxSupply
  "https://example.com/metadata"   // baseURI
);

// Mint a token
await nft.safeMint(ownerAddress, 1);

// Transfer token
await nft.transferFrom(fromAddress, toAddress, 1);

// Approve spender
await nft.approve(spenderAddress, 1);

// Get token URI
const uri = await nft.tokenURI(1);
```

## Gas Optimization

- Efficient storage layout with mappings for O(1) lookups
- Minimal state writes in frequently called functions
- Optimized string conversion utilities
- Hardhat compiler optimization enabled (200 runs)

## Security Considerations

- Access control via owner modifier
- Input validation for addresses and token IDs
- Prevention of double-minting
- Safe balance updates with atomicity
- Proper event emission for all state changes
- Revert messages for all failure cases

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

MIT License - see LICENSE file for details

## Author

NagataSatya Sri Prasad Neelam (@nnssprasad97)
