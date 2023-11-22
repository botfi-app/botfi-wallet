const path = require("path")
const fsp = require('fs/promises')
const { Interface } = require("ethers")

const contracts = [
    "Balances",
    "DeploylessMulticall2"
]

const artifactsDir = path.resolve(path.dirname(__dirname), "artifacts")
const bytesCodeFile = path.resolve(path.dirname(__dirname), "src/config/deployless/bytecodes.json")
const abiDir = path.resolve(path.dirname(__dirname), "src/data/abi/deployless")

const run = async () => {
    
    for(let contractName of contracts){

        console.log("Processing Deployless Contract: ", contractName)

        let artiffactFile = path.resolve(
                                artifactsDir, 
                                "contracts", 
                                `${contractName}.sol`,
                                `${contractName}.json`
                            )

        //lets fetch the artifact filee 
        let artifactData = require(artiffactFile)

    
        //lets fetch the bytecodes file 
        let savedBytecodes = {}

        try{
            savedBytecodes = require(bytesCodeFile)
        } catch(e){}
        
        savedBytecodes[contractName] = artifactData.bytecode

        console.log("Saving Bytecode for: ", contractName)
        // lets save the file 
        await fsp.writeFile(bytesCodeFile, JSON.stringify(savedBytecodes, null, 2))

        let abiFilePath = path.resolve(abiDir, `${contractName}.json`)

        // lets save optimimzed version
        let iface = new Interface(artifactData.abi)

        let oAbi = `["${iface.format(false)}"]`

        console.log("Saving ABI for: ", contractName, " at ", abiFilePath )
        await fsp.writeFile(abiFilePath, oAbi)
    }
}

run()