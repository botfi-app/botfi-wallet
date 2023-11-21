import mcall3Config from "../src/config/multicall3/index.js"
import fetch from "node-fetch";
import fsp from "fs/promises"
import path from "path";
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("__dirname===>", path.dirname(__dirname))

const chainsFile = path.resolve(path.dirname(__dirname), "src/config/multicall3/chains.json")

console.log("chainsFile===>", chainsFile)

const run  = async () => {
    try {

        console.log("Updating Multicall 3 chains data ")
        let deploymentsUri = mcall3Config.deploymentsUri || null 

        if(deploymentsUri == null) return;

        const response = await fetch(deploymentsUri);
        const dataArr = await response.json();

        let processedData = []

        //console.log(dataArr)
        for(let item of dataArr){
            processedData.push(item.chainId)
        }

        console.log("Writing Multicall 3 chains data ")
        await fsp.writeFile(chainsFile, JSON.stringify(processedData))
    } catch(e){
        console.log("scripts#multicall3#", e, e.stack)
    }
}


run()