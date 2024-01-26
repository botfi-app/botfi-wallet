import appDevConfig from "./app_dev"

let is_dev = import.meta.env.DEV
let devConfig = {}

if(is_dev){
    devConfig = appDevConfig
}

//console.log("is_dev===>", is_dev)

export default {
    
    app_name: "BotFi Wallet",

    platforms: {
        "pwa.botfi.app":  "pwa",
        "tbot.botfi.app": "telegram",
        "localhost":      "capacitor",
        "192.168.8.100":  "capacitor",
        "native-dev.botfi.app":  "capacitor",
    },

    server_url: "https://api.botfi.app",

    chains_data_url: "https://github.com/ethereum-lists/chains/blob/master/_data/chains",

    ///is dev
    is_dev,

    crypto_icons_cdn: "https://assets.botfi.app",

    // gecko api endpoint 
    gecko_api_endpoint: "https://api.coingecko.com/api/v3/",

    bugsnag_key: "82899ee9f9542a97b05fa4cf393ce712",

    ipfs_gateway: "https://dweb.link/",

    arweave_gateway: "https://arweave.net/",

    default_explorer: "https://routescan.io/",

    ...devConfig
}