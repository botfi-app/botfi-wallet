const path = require("path")
const fg = require("fast-glob")
const fsp = require('fs/promises');
//const { Interface: eInterface } = require("ethers")

const ABIsPath =  path.resolve(path.dirname(__dirname), "src/data/abi")
const optimizedABIPath =  path.resolve(path.dirname(__dirname), "src/data/abi_min")

const getEthers = async () => {
    let url = "./_ethers.6.9.0.js";//use this for now, the one used in the main app has a bug
    let ethers = await import(url)
    return ethers;
}

const run = async () => {

    let ethers = await getEthers()

    const { Interface: eInterface } = ethers

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
                        .replace(/(\.json)$/i,"")

        outPath = `${outPath}.json`

        let outDir = path.dirname(outPath)

        await fsp.mkdir(outDir, { recursive: true })

        const iface = new eInterface(abiData)

        console.log()
        let minAbi = iface.format(false)

        console.log(`Saving Optimized ABI at ${outPath}`)

        let outData = `export default ${JSON.stringify(minAbi)}`
        
        await fsp.writeFile(outPath, outData)
        console.log()
    }
}

run()