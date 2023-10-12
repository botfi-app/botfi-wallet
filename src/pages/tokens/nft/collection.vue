<route>
    { 
      name: "nft-collection", 
      path: "/tokens/nft/collection/:chainId([0-9]+)/:contract(0x[a-fA-F0-9]{40})" 
    }
</route>
<script setup>
import { useNFT } from '../../../composables/useNFT'
import Utils from '../../../classes/Utils';
import { useRoute } from 'vue-router';
import { onBeforeMount, ref } from 'vue';
import Http from '../../../classes/Http';
import CollapsibleText from '../../../components/common/CollapsibleText.vue';
import NFTItemCard from '../../../components/tokens/NFTItemCard.vue';
import { useNetworks } from '../../../composables/useNetworks';
import { useWalletStore } from '../../../store/walletStore';
import WalletSelect from '../../../components/header/WalletSelect.vue';

const route     = useRoute()
const pageError = ref("")
const contract  = ref("")
const chainId   = ref()
//const pageTitle = ref("NFT Collection")
const isLoading = ref(false)
const dataObj   = ref(null)
const  { getActiveNetworkInfo }  = useNetworks()
const  {  getActiveWalletInfo } = useWalletStore()

const activeWalletAddr = ref("")

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {
    try {

        let params = route.params; 
        let _contract = params.contract 
        let _chainId   = params.chainId

        if(!Utils.isAddress(_contract)){
            return pageError.value = `Invalid collection address`
        }

        if(!/\d+/g.test(_chainId)){
            return pageError.value = `Invalid chain`
        }

        contract.value = _contract
        chainId.value = _chainId

        isLoading.value = true 

        let queryParams = { chainId: _chainId, contract: _contract }
        
        let resultStatus = await Http.getApi(`/nft/collection/info`, queryParams)

        if(resultStatus.isError()){
            return pageError.value = resultStatus.getMessage()
        }

        let resultObj = resultStatus.getData()

        //console.log("resultObj===>", resultObj)

        if(resultObj == null){
            return pageError.value = "Collection not found"
        }

        activeWalletAddr.value = (await getActiveWalletInfo()).address

        let activeNetworkInfo = await getActiveNetworkInfo()

        //console.log("activeNet===>", activeNet)
        resultObj.chain  = `${activeNetworkInfo.name} (${resultObj.chainId})`
                
        dataObj.value = resultObj

        //pageTitle.value = resultObj.name 
        
    } catch(e) {
        Utils.logError("tokens#nft-collection#[contract]:", e)
        pageError.value = Utils.generalErrorMsg
    } finally{
        isLoading.value = false
    }
} 
</script>
<template>
    <WalletLayout
        title=""
        :showNav="false"
        :hasNetSelect="false"
        :hasAddrSelect="true"
        :pageError="pageError"
    >   

        <NativeBackBtn 
            url="/tokens/import-nft"
        />

        <div class="w-400 mb-5">
            <loading-view :isLoading="isLoading">
                <div v-if="dataObj != null">
                    
                    <div class="p-2">
                        <WalletSelect 
                            btnClass="rounded-lg btn-none text-primary wallet-select-with-bg" 
                        />
                    </div>

                    <div class="d-flex justify-content-center p-2">
                        <img 
                            class="collection-preview rounded-lg shadow"
                            :src="Utils.getNFTPreviewUrl(dataObj, 'large')"
                            loading="lazy"
                        />
                    </div>
                    <div class="text-justify description mt-2 mx-3">
                        <CollapsibleText 
                            :content="dataObj.description" 
                            :lines="2"
                        />
                    </div>
                    <div class="mt-2 mb-2 px-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="fw-bold text-uppercase fs-12 hint muted">
                                Details
                            </div>
                        </div>
                        <div>
                            <template v-for="(value,key) in dataObj">
                                <div class="d-flex align-items-center justify-content-between py-2 details"
                                    v-if="['name', 'symbol', 'standard', 'contract', 'chain'].includes(key)"
                                >
                                    <div class="text-uppercase hint d-block fs-10 key text-start fw-bold pe-2">
                                        {{ key }}
                                    </div>
                                    
                                    <div v-if="key == 'contract'" 
                                        class='value contract text-break text-end d-flex fs-14 fw-medium'
                                    >
                                        <CopyBtn :text="value" btnClasses="text-primary" />
                                        <div>{{ value }}</div>    
                                    </div>
                                    <div v-else class='value text-break text-end fs-14 fw-medium'>
                                        <span v-if="key=='standard'" class='text-uppercase'>
                                            {{ value }}
                                        </span>
                                        <span v-else>{{ value }}</span>
                                    </div>
                                </div>
                            </template>
                        </div>
                        <div class="my-3">
                            <div class="fw-bold text-uppercase fs-12 hint muted ls-2 px-1 pb-3">
                                NFTs
                            </div>
                            <div class="pb-2">
                                <InfiniteScroll 
                                    uri="/nft/collection/items"
                                    :queryParams="{ contract, chainId }"
                                    resultsDataKey=""
                                    :renderer="NFTItemCard"
                                    containerClass="d-flex flex-wrap justify-content-center"
                                    :extraData="{ 
                                        collectionInfo: dataObj,
                                        activeWalletAddr
                                    }"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </loading-view>
        </div>
    </WalletLayout>
</template>
<style lang="scss" scoped>


.collection-preview {
    width: 100%;
    max-height: 50vh;
}
.description {
    text-align:start;
}

.details {
    .key {
        width: 200px;
       max-width: 40%;
    }

}
</style>