import supported_chains from "./chains.json"
import system_multicall_addrs from './system.json'

Object.keys(system_multicall_addrs)
    .forEach( c => supported_chains.push(parseInt(c)) )

    //console.log("supported_chains===>", supported_chains)

export default {
    enabled:  true, 
    contract: "0xcA11bde05977b3631167028862bE2a173976CA11",
    version:  2,
    supported_chains,
    system_multicall_addrs
}