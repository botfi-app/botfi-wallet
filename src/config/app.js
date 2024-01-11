import appDevConfig from "./app_dev"

let is_dev = import.meta.env.DEV
let devConfig = {}

if(is_dev){
    devConfig = appDevConfig
}

export default {
    
    app_name: "BotFi Wallet",

    platforms: {
        "pwa.botfi.app": "pwa",
        "tbot.botfi.app": "telegram"
    },

    server_url: "https://api.botfi.app",

    chains_data_url: "https://github.com/ethereum-lists/chains/blob/master/_data/chains",

    ///is dev
    is_dev,

    // gecko api endpoint 
    gecko_api_endpoint: "https://api.coingecko.com/api/v3/",

    bugsnag_key: "82899ee9f9542a97b05fa4cf393ce712",

    ipfs_gateway: "https://dweb.link/",

    arweave_gateway: "https://arweave.net/",

    default_explorer: "https://routescan.io/",

    ...devConfig
}