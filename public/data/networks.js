
export default {
    
    default: 56,
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
            rpc: ["https://ethereum.publicnode.com"],
            explorers: [ "https://ethercan.io"],
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
            rpc: ["https://polygon-bor.publicnode.com"],
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
            rpc: ["https://bsc.publicnode.com"],
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
            rpc: ["https://avalanche-c-chain.publicnode.com"],
            explorers: [ "https://snowtrace.io/"],
            icon: "/images/crypto/avax.svg"
        },

        106: { 
            name: "Velas EVM",
            chainId: 106,
            chain: "Velas",
            shortName: "VLX",
            nativeCurrency: {
                name:       "Velas",
                symbol:     "VLX",
                decimals:   18
            },
            rpc: ["https://evmexplorer.velas.com/rpc"],
            explorers: [ "https://evmexplorer.velas.com/rpc"],
            icon: "/images/crypto/avax.svg"
        },

        250: { 
            name: "Fantom Opera",
            chainId: 250,
            chain: "Fantom",
            shortName: "FTM",
            nativeCurrency: {
                name:       "Fantom",
                symbol:     "FTM",
                decimals:   18
            },
            rpc: ["https://fantom.publicnode.com"],
            explorers: ["https://ftmscan.com/"],
            icon: "/images/crypto/ftm.svg"
        },

        25: { 
            name: "Cronos Mainnet",
            chainId: 25,
            chain: "Cronos",
            shortName: "CRO",
            nativeCurrency: {
                name:       "Cronos",
                symbol:     "CRO",
                decimals:   18
            },
            rpc: ["https://evm.cronos.org"],
            explorers: ["https://cronos.org/explorer"],
            icon: "/images/crypto/cro.svg"
        },

        100: { 
            name: "Gnosis Chain",
            chainId: 100,
            chain: "Gnosis",
            shortName: "GNO",
            nativeCurrency: {
                name:       "Gnosis",
                symbol:     "GNO",
                decimals:   18
            },
            rpc: ["https://rpc.gnosischain.com"],
            explorers: ["https://gnosisscan.io"],
            icon: "/images/crypto/gno.svg"
        },

        1284: { 
            name: "Moonbeam",
            chainId: 1284,
            chain: "Moonbeam",
            shortName: "GLMR",
            nativeCurrency: {
                name:       "Moonbeam",
                symbol:     "GLMR",
                decimals:   18
            },
            rpc: ["https://rpc.api.moonbeam.network"],
            explorers: ["https://moonbeam.moonscan.io/"],
            icon: "/images/crypto/glmr.svg"
        },

        86: { 
            name: "GateChain Mainnet",
            chainId: 86,
            chain: "Gate",
            shortName: "Gate",
            nativeCurrency: {
                name:       "Gate",
                symbol:     "GT",
                decimals:   18
            },
            rpc: ["https://evm.nodeinfo.cc"],
            explorers: ["https://gatescan.org"],
            icon: "/images/crypto/gt.svg"
        },

        66: { 
            name: "OKExChain Mainnet",
            chainId: 66,
            chain: "OKExChain",
            shortName: "okb",
            nativeCurrency: {
                name:       "OKB",
                symbol:     "OKB",
                decimals:   18
            },
            rpc: ["https://exchainrpc.okex.org"],
            explorers: ["https://www.oklink.com/okexchain"],
            icon: "/images/crypto/okb.svg"
        },

        40: { 
            name: "Telos EVM Mainnet",
            chainId: 40,
            chain: "Telos",
            shortName: "TLOS",
            nativeCurrency: {
                name:       "Telos",
                symbol:     "TLOS",
                decimals:   18
            },
            rpc: ["https://mainnet.telos.net/evm"],
            explorers: ["https://teloscan.io"],
            icon: "/images/crypto/tlos.svg"
        },

        128: { 
            name: "Huobi ECO Chain Mainnet",
            chainId: 128,
            chain: "Heco",
            shortName: "Heco",
            nativeCurrency: {
                name:       "Huobi Token",
                symbol:     "HT",
                decimals:   18
            },
            rpc: ["https://http-mainnet.hecochain.com"],
            explorers: ["https://hecoinfo.com"],
            icon: "/images/crypto/ht.svg"
        },

        1101: {
            name: "Polygon zkEVM",
            chainId: 1101,
            chain: "ETH",
            shortName: "zkevm",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                icon: "/images/crypto/eth.svg"
            },
            rpc: ["https://zkevm-rpc.com"],
            explorers: [ "https://zkevm.polygonscan.com/"],
            icon: "/images/crypto/pols.svg"
        },
    }
}