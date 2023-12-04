const path = require("path")
const fg = require("fast-glob")
const fsp = require('fs/promises');
//const { Interface: eInterface } = require("ethers")

const addressPath =   path.resolve(path.dirname(__dirname), "src/config/contracts/botfi")


const run = async () => {

    let dataArr = await fg(`${addressPath}/*.json`)

    let mainContractsJsFile = path.resolve(
                                path.dirname(__dirname), 
                                "src/config/contracts/botfi/index.js"
                            )

    let mainContractsData = {}
    
    try { mainContractsData = (await import(mainContractsJsFile)).default } catch(e) {}

    console.log(`Processing BotFi Contract Addresses`)

    for(let addrPath of dataArr){

        ///console.log("addrPath===>", addrPath)

        let fileData = require(addrPath)
        let chainId = path.basename(addrPath)
                            .replace(/(\.json)$/, "")
        
        chainId = parseInt(chainId)

        //console.log("chainId===>", chainId)

        mainContractsData[chainId] = fileData
    }

    //console.log("contractsData===>", mainContractsData)
    
    let dataToWrite = `export default ${JSON.stringify(mainContractsData, null, 2)}`

    await fsp.writeFile(mainContractsJsFile, dataToWrite)
}

run()