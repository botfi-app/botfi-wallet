export default {

    eth_subscribe: { hasPermission: false },
    eth_subscribe: { hasPermission: false },
    
    wallet_addEthereumChain: { 
        hasPermission: true,
        template: `
            <div>{{WEBSITE}} is requesting to add a new blockchain to your wallet.</div>
            <div class="my-1 mt-2">Network Name: {{CHAIN_NAME}}</div>
            <div class="my-1">Chain ID: {{CHAIN_ID}}</div>
        `,
        askAlways: true,
        confirmBtn: 'Add Network'
    },

    wallet_switchEthereumChain: { 
        hasPermission: true,
        template: "{{WEBSITE}} requesting permission to switch your current netwrk to {{CHAIN_NAME}} ({{CHAIN_ID}})",
        confirmBtn: 'Switch Network'
    },

    wallet_watchAsset: {
        hasPermission: false,
        /*template: "{{WEBSITE}} requests permission to import an asset into your wallet.",
        askAlways: true,
        confirmBtn: 'Add Asset'*/
    },

    /*wallet_scanQRCode: {
        hasPermission: true,
        template: "{{WEBSITE}} wants to utilize the QRCode scanner",
        askAlways: true
    },*/

    eth_requestAccounts: {
        hasPermission: true,
        template: "{{WEBSITE}} is  requesting permission to connect with your wallet.",
        askAlways: false,
        confirmBtn: 'Connect'
    },

    eth_accounts: {
        alias: "eth_requestAccounts"
    },

    eth_signTypedData_v4: {
        hasPermission: true,
        askAlways: true,
        template: "",
        confirmBtn: 'Sign'
    },

    personal_sign: {
        hasPermission: true,
        askAlways: true,
        confirmBtn: 'Sign'
    },

    eth_sendTransaction: {
        hasPermission: true,
        askAlways: true,
        template: "{{WEBSITE}} is requesting authorization to perform a transaction using your wallet",
        warning: "This operation may incur costs. Please only grant access to trusted websites."
    },

    web3_clientVersion: {
        hasPermission: false,
    },

    eth_blockNumber: {
        hasPermission: false,
    },

    eth_call: {
        hasPermission: false,
    },

    eth_chainId: {
        hasPermission: false,
    },

    net_version: { hasPermission: false },

    eth_coinbase: { hasPermission: false },

    eth_estimateGas: { hasPermission: false },

    eth_feeHistory: { hasPermission: false },

    eth_gasPrice: { hasPermission: false },

    eth_getBalance: { hasPermission: false },

    eth_getBlockByHash: { hasPermission: false },

    eth_getBlockByNumber: { hasPermission: false },

    eth_getBlockReceipts: { hasPermission: false },

    eth_getBlockTransactionCountByHash: { hasPermission: false },

    eth_getBlockTransactionCountByNumber: { hasPermission: false },

    eth_getCode: { hasPermission: false },

    eth_getFilterChanges: { hasPermission: false },

    eth_getFilterLogs:  { hasPermission: false },

    eth_getLogs: { hasPermission: false },

    eth_getProof: { hasPermission: false },

    eth_getStorageAt: { hasPermission: false },

    eth_getTransactionByBlockHashAndIndex: { hasPermission: false },

    eth_getTransactionByBlockNumberAndIndex: { hasPermission: false },

    eth_getTransactionByHash: { hasPermission: false },

    eth_getTransactionCount: { hasPermission: false },

    eth_getTransactionReceipt: { hasPermission: false },

    eth_getUncleCountByBlockHash: { hasPermission: false },

    eth_getUncleCountByBlockNumber: { hasPermission: false },

    eth_maxPriorityFeePerGas: { hasPermission: false },

    eth_newBlockFilter: { hasPermission: false },

    eth_newFilter: { hasPermission: false },

    eth_newPendingTransactionFilter: { hasPermission: false },

    eth_syncing: { hasPermission: false },

    eth_uninstallFilter:  { hasPermission: false },
}