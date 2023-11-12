
export default {
    
    default: 1,
    networks: {

        1: { 
            name: "Ethereum",
            chainId: 1,
            chain: "ETH",
            shortName: "eth",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18
            },
            rpc: ["https://eth.llamarpc.com"],
            explorers: [ "https://Ethercan.io"],
            icon: "/images/crypto/eth.svg"
        },

        137: {
            name: "Polygon",
            chainId: 137,
            chain: "MATIC",
            shortName: "matic",
            nativeCurrency: {
                name:       "MATIC",
                symbol:     "MATIC",
                decimals:   18
            },
            rpc: ["https://polygon.llamarpc.com"],
            explorers: [ "https://polygonscan.com"],
            icon: "/images/crypto/matic.svg"
        },

        56: {
            name: "BNBChain",
            chainId: 56,
            chain: "BSC",
            shortName: "bnb",
            nativeCurrency: {
                name:       "BNB",
                symbol:     "BNB",
                decimals:   18
            },
            rpc: ["https://bsc-dataseed.bnbchain.org", "https://bsc-dataseed1.defibit.io", "https://bsc-dataseed1.ninicoin.io"],
            explorers: [ "https://bscscan.com"],
            icon: "/images/crypto/bnb.svg"
        },

        42161: {
            name: "Arbitrum One",
            chainId: 42161,
            chain: "ETH",
            shortName: "arb",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                icon: "/images/crypto/eth.svg"
            },
            rpc: ["https://arb1.arbitrum.io/rpc"],
            explorers: [ "https://arbiscan.io/"],
            icon: "/images/crypto/arb.svg"
        },

        324: {
            name: "zkSync Era Mainnet",
            chainId: 324,
            chain: "ETH",
            shortName: 'zksync',
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                icon: "/images/crypto/eth.svg"
            },
            rpc: ["https://mainnet.era.zksync.io"],
            explorers: [ "https://explorers.zksync.io/"],
            icon: "/images/crypto/zksync.svg"
        },

        10: {
            name: "OP Mainnet",
            chainId: 10,
            chain: "ETH",
            shortName: "op",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                icon: "/images/crypto/eth.svg"
            },
            rpc: ["https://mainnet.optimism.io"],
            explorers: [ "https://explorers.optimism.io"],
            icon: "/images/crypto/op.svg"
        },

        8453: {
            name: "Base Mainnet",
            chainId: 8453,
            chain: "ETH",
            shortName: "base",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                icon: "/images/crypto/eth.svg"
            },
            rpc: ["https://mainnet.base.org"],
            explorers: [ "https://basescan.org"],
            icon: "/images/crypto/base.svg"
        },

        59144: {
            name: "Linea Mainnet",
            chainId: 59144,
            chain: "ETH",
            shortName: "linea",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                icon: "/images/crypto/eth.svg"
            },
            rpc: ["https://rpc.linea.build"],
            explorers: [ "https://lineascan.build/"],
            icon: "/images/crypto/linea.svg"
        },

        43114: { 
            name: "Avalanche Network",
            chainId: 43114,
            chain: "AVAX",
            shortName: "eth",
            nativeCurrency: {
                name:       "Avalanche",
                symbol:     "AVAX",
                decimals:   18
            },
            rpc: ["https://api.avax.network/ext/bc/C/rpc"],
            explorers: [ "https://snowtrace.io/"],
            icon: "/images/crypto/avax.svg"
        },
    }
}