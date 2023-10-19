<script setup>
import { nextTick, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useNFT } from '../../../composables/useNFT'
import ImportedNFTCard from "../../tokens/ImportedNFTCard.vue"
import Utils from '../../../classes/Utils';

const props = defineProps({
    limit: { type: null, default: null },
    enableViewAllBtn: { type: Boolean, default: false }
})

const { getNFTs,updateOnChainNFTData, removeNFT  } = useNFT()
const initialized = ref(false)
const dataToRender  = ref({})
const dataState = ref(Date.now())
const nftItems = ref({})
let updateTimer = null


onBeforeMount(async () => {
    
    await fetchNFTs()

    updateTimer = window.setInterval(fetchNFTs, 40_000)

    initialized.value = true
})

const fetchNFTs = async () => {
    await updateOnChainNFTData()
    nftItems.value = await getNFTs(props.limit)
}

const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}

onBeforeUnmount(() => {
    if(updateTimer) clearInterval(updateTimer)
})

const doRemoveNFT = async (id) => {

    let loader;

    try {
        

        //console.log("id====>", id)
        //console.log("nftItems.value[id]====>", nftItems.value[id])

        let _nft = nftItems.value[id].nftInfo;

        let html = `${_nft.name} (id: ${_nft.tokenId}) will be removed`

        let action =   await Utils.getSwal().fire({
                            showCancelButton: true,
                            confirmButtonText: 'Confirm',
                            denyButtonText:    'Cancel',
                            html,
                            title: "Confirm Action",
                        })

        if(!action.isConfirmed) return;
                        
        loader = Utils.loader(`Removing ${_nft.name} (id: ${_nft.tokenId})`)

        let resultStatus = await removeNFT(id)

        if(resultStatus.isError()){
            return Utils.errorAlert(resultStatus.getMessage())
        }   
        
        Utils.toast(`NFT item removed`)

        nftItems.value = await getNFTs(props.limit)

        nextTick(()=> {
            dataState.value = Date.now()
        })
        
    } catch(e){
        Utils.logError(`NFTsTab#doRemoveNFT:`, e) 
        Utils.errorAlert(Utils.generalErrorMsg)
    } finally {
        if(loader) loader.close()
    }
} //end remove nft

const reloadItems = async () => {
    let loader = Utils.loader("Updating NFTs")
    await fetchNFTs()
    dataState.value = Date.now()
    loader.close()
}
</script>
<template>
     <div v-if="initialized">      
        <div class="mx-2 px-1 mt-2">
            <div class="py-3">
                <div class="d-flex align-items-center justify-content-center">
                    <search-form 
                        placeholder="Search"
                        @change="onSearch"
                        :dataToFilter="nftItems"
                        :filterKeys="['name', 'collection', 'symbol']"
                        :mode="{start: true, end: true }"
                        :key="dataState"
                        class="flex-grow-1"
                    />
                    <button @click.prevent="reloadItems"
                        class="btn btn-none text-success rounded-circle btn-sm mx-2 p-0"
                    >
                        <Icon name="solar:refresh-bold" :size="28" />
                    </button>
                    <router-link to="/tokens/import-nft?ref=wallet&type=nft" 
                        class="btn btn-none text-primary rounded-circle btn-sm p-0"
                    >
                        <Icon name="gala:add" :size="28" />
                    </router-link>
                </div>
            </div>
            <div class="d-flex flex-wrap justify-content-center">
                <template v-for="(item, id) in dataToRender" :key="id">
                    <ImportedNFTCard 
                        :data="item" 
                        @remove-nft="doRemoveNFT" 
                    />
                </template>
            </div>

            <div v-if="props.enableViewAllBtn && Object.keys(nftItems).length > 0">
                <div class="d-flex mt-2 mb-3 me-3 justify-content-end">
                    <router-link to="/tokens#tab-nfts" 
                        class="btn btn-outline-primary rounded-pill shadow"
                    >
                        <div class="d-flex align-items-center">
                            <div class="me-2">View All</div>
                            <Icon name="solar:arrow-right-line-duotone" />
                        </div>
                    </router-link>
                </div>
            </div>

        </div>
    </div>
</template>