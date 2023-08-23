
export default {
    
    default: 1,
    networks: {

        1: {
            chainName: "Ethereum",
            chainId: 1,
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
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18
            },
            rpcUrls: ["https://mainnet.era.zksync.io"],
            blockExplorerUrls: [ "https://explorer.zksync.io/"]
        },

        8453: {
            chainName: "Base Mainnet",
            chainId: 8453,
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
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18
            },
            rpcUrls: ["https://linea-mainnet.infura.io/v3"],
            blockExplorerUrls: [ "https://lineascan.build/"]
        }
    }
}