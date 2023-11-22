
const fetch = require("node-fetch")
const fsp = require("fs/promises")
const path = require("path")

let url = "https://raw.githubusercontent.com/mds1/multicall/main/deployments.json"

const chainsFile = path.resolve(path.dirname(__dirname), "src/config/multicall3/chains.json")

const run  = async () => {
    try {

        console.log("Updating Multicall 3 chains data ")

        const response = await fetch(url);
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