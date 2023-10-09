<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';
import { useTokens } from '../../composables/useTokens';

const props = defineProps({
    data: { type: Object, default: {} },
    extraData: { type: Object, default: {} },
})

const imgUrl = ref("")
const item = ref(props.data)
const collectionInfo = ref(props.extraData.collectionInfo)
const { importNFT, nftExists } = useTokens()
const activeWalletAddress = ref(props.extraData.activeWalletAddress)
const nftId = ref("")
const nftExistsInDb = ref(false)
const botUtils = inject("botUtils")

onBeforeMount( async() => {

    let nft = props.data

    let userId  = botUtils.getUid()
    let { chainId, collection, tokenId } = nft.chainId;
    let walletAddr = activeWalletAddress.value
    
    nftId.value = Utils.generateUID(`${userId}-${chainId}-${walletAddr}-${collection}-${tokenId}`)

    nftExistsInDb.value = nftExists(nftId.value)

    imgUrl.value = Utils.getNFTPreviewUrl(props.data, "small")    
})

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

        //console.log("tokenInfo====>", tokenInfo)

        tokenInfo.standard = colInfo.standard

        tokenInfo.collectionInfo = {
            name:       colInfo.name, 
            symbol:     colInfo.symbol,
            standard:   colInfo.standard,
            chainId:    colInfo.chainId,
            contract:   colInfo.contract,
            geckoId:    colInfo.geckoId || ""
        }

        loader = Utils.loader("Importing NFT")

        let resultStatus = await tokensCore.importNFT(tokenInfo, activeWalletAddress)

        if(resultStatus.isError()){
            return Utils.errorAlert(resultStatus.getMessage())
        }

        Utils.successAlert(`${tokenInfo.name} (id: ${tokenInfo.tokenId}) imported`)
        
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
                    class="btn btn-primary mt-2 btn-sm rounded-pill fw-bold fs-12"
                    :disable="nftExistsInDb"
                >
                    <div v-if="nftExistsInDb" class='fst-italics'>Imported</div>
                    <div v-else>Import</div>
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