/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { computed, inject, onBeforeMount, ref, toRaw } from "vue"
import { useDB } from "./useDB"
import { useNetworks } from "./useNetworks"
import Utils from "../classes/Utils"
import erc721Abi from "../data/abi/erc721.json"
import erc1155Abi from "../data/abi/erc1155.json"
import Status from "../classes/Status"
import { getAddress, toBigInt } from "ethers"
import ErrorCodes from "../classes/ErrorCodes"
import app from "../config/app"
import Http from "../classes/Http"

const $state = ref({
    nfts:   {}
})


export const useNFT = () => {

    const net = useNetworks()
    const dbCore = useDB()
    const botUtils = inject("botUtils")


    onBeforeMount(() =>{
        getNFTs()
    })

    const nfts  = computed(() =>  $state.value.nfts );


    const getNFTs = async (limit) => {
        try {

           //console.log("limit===>", limit)

           let netInfo = await net.getActiveNetworkInfo()
           
           let chainId = netInfo.chainId
           let userId = botUtils.getUid()

           let db = await dbCore.getDB()

           let nftsArr  =  await db.nfts.where({ chainId, userId })
                               .reverse()
                               .sortBy("createdAt")
                               

           let nftsObj = {}

           //nftsArr.reverse()
           
           nftsArr.forEach(item => nftsObj[item.id] = item )
           
           $state.value.nfts = nftsObj;

           //console.log("nftsObj=======>",nftsObj)

           if(limit != null && Number.isInteger(limit) && nftsArr.length > (limit+1)) {
               let slicedItems = Object.fromEntries(
                   Object.entries(nftsObj).slice(0,limit+1)
               )
               return slicedItems
           }

           return nftsObj;

       } catch(e){
           console.log("useNFT#getNFTs:",e, e.stack)
           return {}
       }
   }

   const getNFTById = async (id) => {

       let db = await dbCore.getDB()
       let userId = botUtils.getUid()

       let nftItem = await db.nfts.where({ id, userId }).first() || null

       return nftItem
   }

   const updateOnChainNFTData = async () => {
       try {

           if(window.__botFiNFTsUpdating) return;

           window.__botFiNFTsUpdating = true;

           let netInfo = await net.getActiveNetworkInfo()
           
           let chainId = netInfo.chainId
           let userId = botUtils.getUid()

           let db = await dbCore.getDB()

           //lets get the web3 conn
           let web3ConnStatus = await net.getWeb3Conn()

           if(web3ConnStatus.isError()){
               return web3ConnStatus
           }

           let web3Conn = web3ConnStatus.getData()

           let nftsArray =  await db.nfts.where({ chainId, userId })
                               .toArray()

           let inputs = []

           for(let index in nftsArray){
               
               let item = nftsArray[index]

               let nftInfo = item.nftInfo

               let wallet = getAddress(item.wallet)

               let { tokenId, collection: target } = nftInfo

               //let tokenIdBigInt = BigInt(tokenId)

               if(nftInfo.standard == 'erc721'){

                   let abi = erc721Abi;

                   inputs.push(...[
                       {
                           target, 
                           abi, 
                           label:  `ownerOf_${index}`, 
                           method: "ownerOf", 
                           args:   [tokenId] 
                       },
                       {
                           target, 
                           abi, 
                           label:  `balanceOf_${index}`, 
                           method: "balanceOf", 
                           args:   [wallet] 
                       }
                   ])
               } else {

                   let abi = erc1155Abi;

                   inputs.push(...[
                       {
                           abi, 
                           target,
                           label: `balanceOf_${index}`,
                           method: "balanceOf",
                           args: [wallet, tokenId]
                       }
                   ])
               }
           }

           //console.log("nftInfo.standard===>", nftInfo.standard);


           let resultStatus = await web3Conn.staticMulticall(inputs)

           //console.log("resultStatus===>", resultStatus)

           if(resultStatus.isError()){
               Utils.logError("useToken#updateOnChainNFTData:"+ resultStatus.getMessage())
               return resultStatus;
           }

           let resultData = resultStatus.getData() || {}

           //console.log("resultData===>", resultData)

           let bulkData = []

           for(let label of Object.keys(resultData)){
              // console.log("label===>", label)
               let [methodName, dbItemId] = label.split("_")

               dbItemId = parseInt(dbItemId)

               let value = resultData[label]

               let dataInfo = nftsArray[dbItemId]

               //console.log("dataId===>", dbItemId)
               
               if(methodName == "balanceOf"){
                   dataInfo.nftInfo.balance = value
                   dataInfo.nftInfo.balanceDecimal = Number(value)
               } else if(methodName == "ownerOf"){
                   dataInfo.nftInfo.owner = value
               }

               dataInfo.updatedAt = Date.now()

               //console.log("dataInfo===>", dataInfo)
               bulkData.push(dataInfo)
           }

           await db.nfts.bulkPut(bulkData)

           return Status.successPromise()
       } catch(e){
           Utils.logError("useNFT#updateOnChainNFTData:",e, e.stack)
           return Status.errorPromise()
       } finally {
           window.__botFiNFTsUpdating = false
       }
   }
   
   const importNFT = async (nftInfo={}, walletAddr) => {

       try{

           nftInfo = toRaw(nftInfo)

           let requiredFields = [
               'name',
               'symbol',
               'tokenId', 
               'chainId',  
               'collection',
               'collectionInfo',
               'attributes',
               'isCustomImport',
               'tokenUri',
               'standard'
           ]

           if(!Utils.isAddress(walletAddr)){
                return Status.error("Invalid wallet address")
           }

           for (let field of requiredFields){
               if(!(field in nftInfo)){
                   return Status.error(`'${field}' field is missing`)
               }
           }

           let userId = botUtils.getUid()

           let db = await dbCore.getDB()
           
           let { chainId, collection, tokenId } = nftInfo

           let id = Utils.generateUID(`${userId}-${chainId}-${walletAddr}-${collection}-${tokenId}`)

           let now = Date.now()

           let dataToSave = {
               id,
               userId,
               chainId, 
               wallet: walletAddr,
               nftInfo,
               createdAt: now,
               updatedAt: now
           }

           let dId = await db.nfts.put(dataToSave)

           await updateOnChainNFTData()

           return Status.success("", dId)
       } catch(e){
           Utils.logError("useNFT#importNFT:", e)
           return Status.error(Utils.generalErrorMsg)
       }
   }

   const nftExists = async (id) => { getNFTs
       //let _nfts = ($state.value.nfts)
       //return (id in $state.value.nfts)
       let _nfts = (Object.keys($state.value.nfts).length == 0)
                       ? (await getNFTs())
                       : $state.value.nfts

       return (id in _nfts)
   }

   const removeNFT = async (id) => { 
       
       let db = await dbCore.getDB()
       let userId = botUtils.getUid()

       await db.nfts.where({ id, userId }).delete()

       let newNFTs = await getNFTs()
       
       return Status.success("", newNFTs)
   }

   const getNFTStandard = async (contractAddr)  => {
        try {

            contractAddr = contractAddr.trim()

            if(!Utils.isAddress(contractAddr)){
                return Status.error("Invalid contract address")
            }

            contractAddr = getAddress(contractAddr)

            //lets get the web3 conn
           let web3ConnStatus = await net.getWeb3Conn()

           if(web3ConnStatus.isError()){
               return web3ConnStatus
           }

           let web3Conn = web3ConnStatus.getData()

           let code = await web3Conn.getCode(contractAddr)

           if(code == '0x'){
                return Status.error("Address is not a smart contract")
           }

           let tokenStandard = ""
           
            if((await web3Conn.isTokenStandard("erc721", contractAddr, code))){
                tokenStandard = "erc721"
            } else if((await web3Conn.isTokenStandard("erc1155", contractAddr, code))){
                tokenStandard = "erc1155"
            } else {
                return Status.error("Unkown token standard")
                            .setCode(ErrorCodes.UNKNOWN_TOKEN_STANDARD)
            }

           return Status.success("", tokenStandard)
        } catch(e){
            Utils.logError("useNFT#importNFT:", e)
           return Status.error(Utils.generalErrorMsg)
        }
    }

    const processNFTMetadataUrl = (url="") => {

        url = url.trim()

        if(url == ""){
            return ""
        }

        if(/^(https?:\/\/)/.test(url)){
            return url
        }

        if(/^(ipfs:\/\/).+/gi.test(url)){
            let uri = url.replace(/^(ipfs:\/\/)/i,"")
            
            if(!uri.startsWith("ipfs/")){
                uri = `ipfs/${uri}`
            }

            let ipfsGateway = app.ipfs_gateway.replace(/(\/)$/,'')

            return `${ipfsGateway}/${uri}`
        }

        if(/^(ar:\/\/).+/ig.test(url)){
            return url.replace(/^(ar:\/\/)/i,app.arweave_gateway)
        }

        return url
    }


    const getNFTMetadata = async(url) => {
        
        url = processNFTMetadataUrl(url)

        let metadataStatus = await Http.getJson(url)

       // console.log("metadataStatus===>", metadataStatus)
        
        if(metadataStatus.isError()){
            let urlB64 = btoa(url)
            metadataStatus = await Http.getApi(`/nft/metadata/${urlB64}`)
        }

        //console.log("metadataStatus====>", metadataStatus)

        if(metadataStatus.isError()){
            return metadataStatus
        }

        let resultData = metadataStatus.getData() || {}

        //console.log("resultData===>", resultData)

        //if("image" in resultData && resultData.image != ''){
           // resultData.image = processNFTMetadataUrl(resultData.image)
        //}

        return Status.successData(resultData)
    }


    const fetchNFTOnChain = async (
        contractAddr, 
        tokenId, 
        standard
    ) => {
        try {

            contractAddr = contractAddr.trim()

            if(!Utils.isAddress(contractAddr)){
                return Status.error("Invalid contract address")
            }

            contractAddr = getAddress(contractAddr)

            //lets get the web3 conn
           let web3ConnStatus = await net.getWeb3Conn()

           if(web3ConnStatus.isError()){
               return web3ConnStatus
           }

           let web3Conn = web3ConnStatus.getData()

           //console.log("web3Conn====>", web3Conn)

           let target = contractAddr

           let inputs = []

           let code = await web3Conn.getCode(contractAddr)

           if(code == '0x'){
                return Status.error("Address is not a smart contract")
           }
           
           let tokenIdBN = BigInt(tokenId.toString())

           let abi; 

           let hasName = false;
           let hasSymbol = false 

           let hasContractUri = (await web3Conn.hasMethod(contractAddr, "contractURI()", code));  
           let hasOwner = (await web3Conn.hasMethod(contractAddr, "name()", code));  
           
           if(standard == 'erc721'){

                abi = erc721Abi
                
                hasName = true 
                hasSymbol = true 

                inputs.push(...[
                    {
                        target, 
                        abi, 
                        label:  `symbol`, 
                        method: "symbol", 
                        args:   [] 
                    }, 
                    {
                        target, 
                        abi, 
                        label:  `name`, 
                        method: "name", 
                        args:   [] 
                    },
                    {
                        target, 
                        abi, 
                        label:  `tokenURI`, 
                        method: "tokenURI", 
                        args:   [tokenIdBN] 
                    },
                    {
                        target, 
                        abi, 
                        label:  `ownerOf`, 
                        method: "ownerOf", 
                        args:   [tokenIdBN] 
                    },
                   
                ])

           
           } else {

                abi = erc1155Abi

                if((await web3Conn.hasMethod(contractAddr, "name()", code))){
                    hasName = true 
                    inputs.push({
                        target, 
                        abi, 
                        label:  `name`, 
                        method: "name", 
                        args:   [] 
                    })
               }   
               
               if((await web3Conn.hasMethod(contractAddr, "symbol()", code))){
                    hasSymbol = true 
                    inputs.push({
                        target, 
                        abi, 
                        label:  `symbol`, 
                        method: "symbol", 
                        args:   [] 
                    })
                }       

                inputs.push(...[
                    {
                        target, 
                        abi, 
                        label:  `uri`, 
                        method: "uri", 
                        args:   [tokenIdBN] 
                    },
                ])
                
           }

           if((await web3Conn.hasMethod(contractAddr, "totalSupply()", code))){
                inputs.push({
                    target, 
                    abi, 
                    label:  `totalSupply`, 
                    method: "totalSupply", 
                    args:   [] 
                })
            }

           if(hasOwner) {
                inputs.push({
                    target, 
                    abi, 
                    label:  `contractOwner`, 
                    method: "owner", 
                    args:   [] 
                })
            }

            if(hasContractUri){
                inputs.push({
                    target, 
                    abi, 
                    label:  `contractURI`, 
                    method: "contractURI", 
                    args:   [] 
                })
            }

            let resultStatus = await web3Conn.staticMulticall(inputs)

            console.log("resultStatus===>", resultStatus)

           if(resultStatus.isError()){
               Utils.logError("useToken#fetchNFTMetadata:"+ resultStatus.getMessage())
               return resultStatus;
           }

           let resultData = resultStatus.getData() || {}

           let collectionInfo = {
                name:       (resultData.name || ""),
                symbol:     (resultData.symbol || ""),
                description: "",
                standard,
                media:      {},
                chainId:    web3Conn.chainId,
                contract:   contractAddr,
            }

            let collectionImage = ''

            if(hasContractUri){

                let contractUri = (resultData.contractURI || "").trim()

                if(contractUri != ''){

                    if(contractUri.includes("{address}")){
                        contractUri = contractUri.replace("{address}", contractAddr)
                    }

                    let contractMetaDataStatus = await getNFTMetadata(contractUri)

                    if(!contractMetaDataStatus.isError()){
                        let contractData = contractMetaDataStatus.getData() || {}

                        if('name' in contractData && contractData.name.trim() != ''){
                            collectionInfo.name = contractData.name
                        }

                        if('symbol' in contractData && contractData.symbol.trim() != ''){
                            collectionInfo.symbol = contractData.symbol
                        }

                        if('description' in contractData && contractData.description.trim() != ''){
                            collectionInfo.description = contractData.description
                        }

                        if('image' in contractData && contractData.image.trim() != ''){
                            collectionImage = contractData.image
                            collectionInfo.media = {
                                image: processNFTMetadataUrl(contractData.image),
                                imageOriginal: contractData.image
                            }
                        }

                        if('external_link' in contractData && contractData.external_link.trim() != ''){
                            collectionInfo.external_link = contractData.external_link
                        }
                    }
                }
            }

           //console.log("collectionInfo=====>", collectionInfo)
            
           ///console.log("resultData====>", resultData) 

           // now lets retrieve the nft metadata 
            let tokenUri = (standard == 'erc721') 
                            ? (resultData.tokenURI || '')
                            : (resultData.uri || '')

            tokenUri = tokenUri.trim()

            if(tokenUri == ''){
                return Status.errorPromise("Contract returned an empty metadata url")
            }

            if(tokenUri.includes("{id}")){
                tokenUri = tokenUri.replace("{id}", tokenId)
            }

            if(tokenUri.includes("{address}")){
                tokenUri = tokenUri.replace("{address}", contractAddr)
            }

            //console.log("tokenUri===>", tokenUri)

            let nftMetadaStatus = await getNFTMetadata(tokenUri)

            if(nftMetadaStatus.isError()){
                return Status.error("Failed to retrieve contract's metadata")
            }

            //console.log("nftMetadaStatus===>", nftMetadaStatus)

            let nftMetaData = nftMetadaStatus.getData() || {}

            let name = (nftMetaData.name || "").trim()
            let symbol = (nftMetaData.symbol || "").trim()
            let description = (nftMetaData.description || "").trim()
            let image = (nftMetaData.image || "").trim()
            //let imageUrl = ""

            if(standard == 'erc721'){
               
                if(name == '' && collectionInfo.name != ''){
                    name = `${name} ${$tokenId}`
                }

                if(symbol == '' && collectionInfo.symbol != ''){
                    symbol = collectionInfo.symbol
                }
            }

            else if(standard == 'erc1155'){
                if(name == '' && collectionInfo.name != ''){
                    name = collectionInfo.name
                }

                if(symbol == '' && collectionInfo.symbol != ''){
                    symbol = collectionInfo.symbol
                }

                if(description == '' && collectionInfo.description != ''){
                    description = collectionInfo.description
                }

                if(image == '' && collectionImage != '') {
                    image = collectionInfo.image
                }
            }

            if(name == ''){
                return Status.error("NFT metadata returned no name")
            }

            let media = {}

            if(image != ''){
                media = {
                    image: {
                        url: processNFTMetadataUrl(image),
                        urlOriginal: image
                     }
                }
            }

            let finalData = {
                name, 
                symbol,
                description,
                media,
                standard,
                tokenId,
                chainId:      web3Conn.chainId,
                collection:   contractAddr,
                collectionInfo,
                attributes:   nftMetaData.attributes || [],
                tokenUri
            }

            return Status.successData(finalData)

        } catch(e){
            Utils.logError("useNFT#fetchOnchainNFTData:", e)
           return Status.error(Utils.generalErrorMsg)
        }
    }

    const removeUserNFTs = async () => {
        try {

            let userId = botUtils.getUid()

            let db = await dbCore.getDB()
 
            await db.nfts.where({userId }).delete()

        } catch(e) {
            Utils.logError("useNFT#removeUserNFTs:", e)
            return Status.error(Utils.generalErrorMsg)
        }
    }

    return {
        nfts,
        importNFT,
        nftExists,
        getNFTs,
        getNFTById,
        updateOnChainNFTData,
        removeNFT,
        getNFTStandard,
        fetchNFTOnChain,
        removeUserNFTs
    }
}