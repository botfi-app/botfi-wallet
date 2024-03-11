
export default {
    
    default: 56,
    networks: {

        1: { 
            chainName: "Ethereum",
            chainId: 1,
            chain: "ETH",
            shortName: "eth",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18
            },
            rpcUrls: ["https://ethereum.publicnode.com"],
            blockExplorerUrls: [ "https://ethercan.io"],
            image: "/images/crypto/eth.svg"
        },

        137: {
            chainName: "Polygon",
            chainId: 137,
            chain: "MATIC",
            shortName: "matic",
            nativeCurrency: {
                name:       "MATIC",
                symbol:     "MATIC",
                decimals:   18
            },
            rpcUrls: ["https://polygon-bor.publicnode.com"],
            blockExplorerUrls: [ "https://polygonscan.com"],
            image: "/images/crypto/matic.svg"
        },

        56: {
            chainName: "BNBChain",
            chainId: 56,
            chain: "BSC",
            shortName: "bnb",
            nativeCurrency: {
                name:       "BNB",
                symbol:     "BNB",
                decimals:   18
            },
            rpcUrls: ["https://bsc.publicnode.com"],
            blockExplorerUrls: [ "https://bscscan.com"],
            image: "/images/crypto/bnb.svg"
        },

        42161: {
            chainName: "Arbitrum One",
            chainId: 42161,
            chain: "ETH",
            shortName: "arb",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                image: "/images/crypto/eth.svg"
            },
            rpcUrls: ["https://arb1.arbitrum.io/rpc"],
            blockExplorerUrls: [ "https://arbiscan.io/"],
            image: "/images/crypto/arb.svg"
        },

        324: {
            chainName: "zkSync Era Mainnet",
            chainId: 324,
            chain: "ETH",
            shortName: 'zksync',
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                image: "/images/crypto/eth.svg"
            },
            rpcUrls: ["https://mainnet.era.zksync.io"],
            blockExplorerUrls: [ "https://era.zksync.network/" ],
            image: "/images/crypto/zksync.svg"
        },

        10: {
            chainName: "OP Mainnet",
            chainId: 10,
            chain: "ETH",
            shortName: "op",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                image: "/images/crypto/eth.svg"
            },
            rpcUrls: ["https://mainnet.optimism.io"],
            blockExplorerUrls: [ "https://optimistic.etherscan.io/"],
            image: "/images/crypto/op.svg"
        },

        8453: {
            chainName: "Base Mainnet",
            chainId: 8453,
            chain: "ETH",
            shortName: "base",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                image: "/images/crypto/eth.svg"
            },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: [ "https://basescan.org"],
            image: "/images/crypto/base.svg"
        },

        59144: {
            chainName: "Linea Mainnet",
            chainId: 59144,
            chain: "ETH",
            shortName: "linea",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                image: "/images/crypto/eth.svg"
            },
            rpcUrls: ["https://rpc.linea.build"],
            blockExplorerUrls: [ "https://lineascan.build/"],
            image: "/images/crypto/linea.svg"
        },

        43114: { 
            chainName: "Avalanche Network",
            chainId: 43114,
            chain: "AVAX",
            shortName: "eth",
            nativeCurrency: {
                name:       "Avalanche",
                symbol:     "AVAX",
                decimals:   18
            },
            rpcUrls: ["https://avalanche-c-chain.publicnode.com"],
            blockExplorerUrls: [ "https://snowtrace.io/"],
            image: "/images/crypto/avax.svg"
        },

        106: { 
            chainName: "Velas EVM",
            chainId: 106,
            chain: "Velas",
            shortName: "VLX",
            nativeCurrency: {
                name:       "Velas",
                symbol:     "VLX",
                decimals:   18
            },
            rpcUrls: ["https://evmexplorer.velas.com/rpc"],
            blockExplorerUrls: ["https://evmexplorer.velas.com/"],
            image: "/images/crypto/avax.svg"
        },

        250: { 
            chainName: "Fantom Opera",
            chainId: 250,
            chain: "Fantom",
            shortName: "FTM",
            nativeCurrency: {
                name:       "Fantom",
                symbol:     "FTM",
                decimals:   18
            },
            rpcUrls: ["https://fantom.publicnode.com"],
            blockExplorerUrls: ["https://ftmscan.com/"],
            image: "/images/crypto/ftm.svg"
        },

        25: { 
            chainName: "Cronos Mainnet",
            chainId: 25,
            chain: "Cronos",
            shortName: "CRO",
            nativeCurrency: {
                name:       "Cronos",
                symbol:     "CRO",
                decimals:   18
            },
            rpcUrls: ["https://evm.cronos.org"],
            blockExplorerUrls: ["https://cronos.org/explorer"],
            image: "/images/crypto/cro.svg"
        },

        100: { 
            chainName: "Gnosis Chain",
            chainId: 100,
            chain: "Gnosis",
            shortName: "GNO",
            nativeCurrency: {
                name:       "Gnosis",
                symbol:     "GNO",
                decimals:   18
            },
            rpcUrls: ["https://rpc.gnosischain.com"],
            blockExplorerUrls: ["https://gnosisscan.io"],
            image: "/images/crypto/gno.svg"
        },

        1284: { 
            chainName: "Moonbeam",
            chainId: 1284,
            chain: "Moonbeam",
            shortName: "GLMR",
            nativeCurrency: {
                name:       "Moonbeam",
                symbol:     "GLMR",
                decimals:   18
            },
            rpcUrls: ["https://rpc.api.moonbeam.network"],
            blockExplorerUrls: ["https://moonbeam.moonscan.io/"],
            image: "/images/crypto/glmr.svg"
        },

        86: { 
            chainName: "GateChain Mainnet",
            chainId: 86,
            chain: "Gate",
            shortName: "Gate",
            nativeCurrency: {
                name:       "Gate",
                symbol:     "GT",
                decimals:   18
            },
            rpcUrls: ["https://evm.nodeinfo.cc"],
            blockExplorerUrls: ["https://gatescan.org"],
            image: "/images/crypto/gt.svg"
        },

        66: { 
            chainName: "OKExChain Mainnet",
            chainId: 66,
            chain: "OKExChain",
            shortName: "okb",
            nativeCurrency: {
                name:       "OKB",
                symbol:     "OKB",
                decimals:   18
            },
            rpcUrls: ["https://exchainrpc.okex.org"],
            blockExplorerUrls: ["https://www.oklink.com/okexchain"],
            image: "/images/crypto/okb.svg"
        },

        40: { 
            chainName: "Telos EVM Mainnet",
            chainId: 40,
            chain: "Telos",
            shortName: "TLOS",
            nativeCurrency: {
                name:       "Telos",
                symbol:     "TLOS",
                decimals:   18
            },
            rpcUrls: ["https://mainnet.telos.net/evm"],
            blockExplorerUrls: ["https://teloscan.io"],
            image: "/images/crypto/tlos.svg"
        },

        128: { 
            chainName: "Huobi ECO Chain Mainnet",
            chainId: 128,
            chain: "Heco",
            shortName: "Heco",
            nativeCurrency: {
                name:       "Huobi Token",
                symbol:     "HT",
                decimals:   18
            },
            rpcUrls: ["https://http-mainnet.hecochain.com"],
            blockExplorerUrls: ["https://hecoinfo.com"],
            image: "/images/crypto/ht.svg"
        },

        1101: {
            chainName: "Polygon zkEVM",
            chainId: 1101,
            chain: "ETH",
            shortName: "zkevm",
            nativeCurrency: {
                name:       "Ethereum",
                symbol:     "ETH",
                decimals:   18,
                chainId:    1,
                image: "/images/crypto/eth.svg"
            },
            rpcUrls: ["https://zkevm-rpc.com"],
            blockExplorerUrls: [ "https://zkevm.polygonscan.com/"],
            image: "/images/crypto/pols.svg"
        },
        7000: {
            chainName: "Zeta Chain",
            chainId: 7000,
            chain: "ZETA",
            shortName: "ZETA",
            nativeCurrency: {
                name:       "ZETA",
                symbol:     "ZETA",
                decimals:   18,
                chainId:    1,
                image: "/images/crypto/zeta.svg"
            },
            rpcUrls: ["https://zetachain-evm.blockpi.network/v1/rpc/public"],
            blockExplorerUrls: [ "https://explorer.zetachain.com/"],
            image: "/images/crypto/zeta.svg"
        },
    }
}