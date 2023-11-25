const path = require("path")
const fg = require("fast-glob")
const fsp = require('fs/promises');
const { Interface: eInterface } = require("ethers")

const ABIsPath =  path.resolve(path.dirname(__dirname), "src/data/abi")
const optimizedABIPath =  path.resolve(path.dirname(__dirname), "src/data/abi_min")

const run = async () => {

    let dataArr = await fg(`${ABIsPath}/**/*.json`)

    console.log(`Optimizing ABI files in ${ABIsPath}`)

    for(let abiPath of dataArr){

        console.log()
        console.log(`Processing ABI File: ${abiPath}`)
        
        let abiData;
        try{ abiData = require(abiPath) } catch(e) { continue; }

        let filename = path.basename(abiPath)

        let fileSubDir = abiPath.replace(ABIsPath, "")

        let outPath = path.join(optimizedABIPath, fileSubDir)

        let outDir = path.dirname(outPath)

        await fsp.mkdir(outDir, { recursive: true })

        const iface = new eInterface(abiData)

        console.log()
        let minAbi = iface.format(false)

        console.log(`Saving Optimized ABI at ${outPath}`)

        await fsp.writeFile(outPath, JSON.stringify(minAbi))
        console.log()
    }
}

run()