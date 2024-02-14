export default {

    "0xa9059cbb": {
        abi:    "transfer(address,uint256)",
        name:   "transfer",
        params: ["to", "amount"]
    },
    
    "0xd505accf": {
        abi:    "permit(address,address,uint256,uint256,uint8,bytes32,bytes32)",
        name:   "permit",
        params: ["owner", "spender", "value", "deadline", "", "", ""]
    },
    
    "0x23b872dd": {
        abi:    "transferFrom(address,address,uint256)",
        name:   "transferFrom",
        params: ["from", "to", "amount"]
    },

    "0x095ea7b3": {
        abi:    "approve(address,uint256)",
        name:   "approve",
        params: ["spender", "amount"]
    },

    "0xb88d4fde": {
        abi:    "safeTransferFrom(address,address,uint256,bytes)",
        name:   "safeTransferFrom",
        params: ["from", "to", "tokenId", "data"]
    },
    
    "0x42842e0e": {
        abi:    "safeTransferFrom(address,address,uint256)",
        name:   "safeTransferFrom",
        params: ["from", "to", "tokenId"]
    },
    
    "0x23b872dd": {
        abi:    "transferFrom(address,address,uint256)",
        name:   "transferFrom",
        params: ["from", "to", "tokenId"]
    }
}