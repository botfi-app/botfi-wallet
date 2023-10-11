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
import { getAddress } from "ethers"


export const useNFTs = () => {

    const net = useNetworks()
    const dbCore = useDB()
    const botUtils = inject("botUtils")

    const $state = ref({
        nfts:   {}
    })

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

       let nftItem = await db.nfts.where({ id, userId })

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
               'tokenId', 
               'chainId',  
               'collection',
               'collectionInfo',
               'standard'
           ]

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


    return {
        nfts,
        importNFT,
        nftExists,
        getNFTs,
        getNFTById,
        updateOnChainNFTData,
        removeNFT
    }
}