
export default {
    
    default: 1,
    networks: {

        1: { 
            chainName: "Ethereum",
            chainId: 1,
            symbol: "ETH",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18
            },
            rpcUrls: ["https://eth.llamarpc.com"],
            blockExplorerUrls: [ "https://etherscan.io"]
        },

        137: {
            chainName: "Polygon",
            chainId: 137,
            symbol: "MATIC",
            nativeCurrency: {
                name:       "Polygon",
                symbol:     "MATIC",
                decimals:   18
            },
            rpcUrls: ["https://polygon.llamarpc.com"],
            blockExplorerUrls: [ "https://polygonscan.com"]
        },

        56: {
            chainName: "BNBChain",
            chainId: 56,
            symbol: "BNB",
            nativeCurrency: {
                name:       "BNB",
                symbol:     "BNB",
                decimals:   18
            },
            rpcUrls: ["https://bsc-dataseed.bnbchain.org", "https://bsc-dataseed1.defibit.io", "https://bsc-dataseed1.ninicoin.io"],
            blockExplorerUrls: [ "https://bscscan.com"]
        },

        42161: {
            chainName: "Arbitrum One",
            chainId: 42161,
            symbol: "ARB",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18
            },
            rpcUrls: ["https://arb1.arbitrum.io/rpc"],
            blockExplorerUrls: [ "https://arbiscan.io/"]
        },

        324: {
            chainName: "zkSync Era Mainnet",
            chainId: 324,
            symbol: "ZKSYNC",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18
            },
            rpcUrls: ["https://mainnet.era.zksync.io"],
            blockExplorerUrls: [ "https://explorer.zksync.io/"]
        },

        10: {
            chainName: "Optimism",
            chainId: 10,
            symbol: "OP",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18
            },
            rpcUrls: ["https://mainnet.optimism.io"],
            blockExplorerUrls: [ "https://explorer.optimism.io"]
        },

        8453: {
            chainName: "Base Mainnet",
            chainId: 8453,
            symbol: "BASE",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18
            },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: [ "https://basescan.org"]
        },

        59144: {
            chainName: "Linea Mainnet",
            chainId: 59144,
            symbol: "LINEA",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18
            },
            rpcUrls: ["https://rpc.linea.build"],
            blockExplorerUrls: [ "https://lineascan.build/"]
        }
    }
}