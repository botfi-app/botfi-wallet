<script setup>
import { onBeforeMount, ref, inject } from 'vue';
import Utils from '../../classes/Utils';
import { useNFTs } from '../../composables/useNFTs';

const props = defineProps({
    data: { type: Object, default: {} },
    extraData: { type: Object, default: {} },
})

const imgUrl = ref("")
const item = ref(props.data)
const collectionInfo = ref(props.extraData.collectionInfo)
const { importNFT, nftExists } = useNFTs()
const activeWalletAddr = ref(props.extraData.activeWalletAddr)
const nftId = ref("")
const nftExistsInDb = ref(false)
const botUtils = inject("botUtils")

onBeforeMount( async() => {
    initialize()
})

const initialize = async () => {

    let nftInfo = props.data

    let userId  = botUtils.getUid()
    let { chainId, collection, tokenId } = nftInfo;
    let walletAddr = activeWalletAddr.value
    
    nftId.value = Utils.generateUID(`${userId}-${chainId}-${walletAddr}-${collection}-${tokenId}`)

    nftExistsInDb.value = await nftExists(nftId.value)

    imgUrl.value = Utils.getNFTPreviewUrl(props.data, "small")   
}

const doImportNFT = async () => {

    let loader;

    try {

        let action =   await Utils.getSwal().fire({
                            showCancelButton: true,
                            confirmButtonText: 'Import',
                            denyButtonText:     'Cancel',
                            html: Utils.getImportNFTConfirmMsg(item.value),
                            title: "Confirm Action",
                        })
        
        if(!action.isConfirmed) return;

        let colInfo = collectionInfo.value
            
        let tokenInfo = item.value
 
        tokenInfo.standard = colInfo.standard

        tokenInfo.collectionInfo = {
            name:       colInfo.name, 
            symbol:     colInfo.symbol,
            standard:   colInfo.standard,
            chainId:    colInfo.chainId,
            contract:   colInfo.contract,
            geckoId:    colInfo.geckoId || ""
        } 

        ///console.log("activeWalletAddress====>", activeWalletAddr.value)

        
        loader = Utils.loader("Importing NFT")

        let resultStatus = await importNFT(tokenInfo, activeWalletAddr.value)

        if(resultStatus.isError()){
            return Utils.errorAlert(resultStatus.getMessage())
        }

        //console.log("nftId.value===>", nftId.value)

        nftExistsInDb.value = nftExists(nftId.value)

       // console.log("nftExistsInDb.value===>", nftExistsInDb.value)

        Utils.toast(`${tokenInfo.name} (id: ${tokenInfo.tokenId}) imported`)
        
    }catch(e){
        Utils.logError("NFTItemCard#importNFT:", e)
        Utils.errorAlert(Utils.generalErrorMsg)
    } finally {
        if(loader) loader.close()
    }
}

</script>
<template>
    <div class="nft-collection-card">
        <div class="card-header" :style="{'background-image': `url(${imgUrl})` }">
            <div class="card-header-img">
                <img 
                    v-lazy="imgUrl" 
                    alt=""
                />
            </div>
        </div>
        <div class="p-2 text-center flex-grow-1 d-flex align-items-center justify-content-center">
            <div class="px-2">
                <div class="fw-bold fs-12 hint font-monospace text-truncate">
                    #{{ item.tokenId }}
                </div>
                <div class="fw-medium item-title text-truncate-multiline text-break">
                    {{ item.name }}
                </div>
                <button @click.prevent="doImportNFT"
                    class="btn btn-primary mt-2 btn-sm rounded-pill fs-12"
                    :disabled="nftExistsInDb"
                >
                    <div v-if="nftExistsInDb" class='fst-italic fw-semibold'>Imported</div>
                    <div v-else class="fw-bold">Import NFT</div>
                </button>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .item-addr {
        background: var(--bs-body-bg-dark-9);
    }
</style>