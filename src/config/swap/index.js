

import supported_chains from "./supported_chains.json"
import routes_ABIs from "./routes_ABIs"

export default {
    enabled:      true, 
    protocol_fee_percent: 0.8, //0.8%
    supported_chains,
    routes_ABIs,
    default_slippage: 0.5 // 1%
}

