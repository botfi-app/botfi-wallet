
export default {
    
    app_name: "BotFi Wallet",

    server_url: "https://dev-server.botfi.app",
    chains_data_url: "https://github.com/ethereum-lists/chains/blob/master/_data/chains",

    ///is dev
    is_dev: import.meta.env.DEV,

    // gecko api endpoint 
    gecko_api_endpoint: "https://api.coingecko.com/api/v3/",

    bugsnag_key: "82899ee9f9542a97b05fa4cf393ce712",

    ipfs_gateway: "https://dweb.link/",

    arweave_gateway: "https://arweave.net/",

    default_explorer: "https://routescan.io/"
}