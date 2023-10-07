<route>
    { 
      name: "nft-collection", 
      path: "/tokens/nft/collection/:chainId([0-9]+)/:contract(0x[a-fA-F0-9]{40})" 
    }
</route>
<script setup>
import { useTokens } from '../../../composables/useTokens'
import Utils from '../../../classes/Utils';
import { useRoute, useRouter } from 'vue-router';
import { onBeforeMount, ref } from 'vue';
import Http from '../../../classes/Http';
import CollapsibleText from '../../../components/common/CollapsibleText.vue';

const route     = useRoute()
const pageError = ref("")
const contract  = ref("")
const chainId   = ref()
const pageTitle = ref("NFT Collection")
const isLoading = ref(false)
const dataObj   = ref(null)
const imageUrl  = ref("")

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
        
        let resultStatus = await Http.getApi(`/nft/collection/${_contract}-${_chainId}`)

        if(resultStatus.isError()){
            return pageError.value = resultStatus.getMessage()
        }

        let resultObj = resultStatus.getData()

        console.log("resultObj===>", resultObj)

        if(resultObj == null){
            return pageError.value = "Collection not found"
        }


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
        :title="pageTitle"
        :showNav="false"
        :hasNetSelect="false"
        :hasAddrSelect="false"
        :pageError="pageError"
    >   

        <NativeBackBtn 
            url="/tokens/import-nft"
        />

        <div class="w-400 mb-5">
            <loading-view :isLoading="isLoading">
                <div v-if="dataObj != null">
                    <div class="d-flex justify-content-center p-2">
                        <img 
                            class="collection-preview rounded shadow"
                            :src="Utils.getNFTPreviewUrl(dataObj, 'large')"
                        />
                    </div>
                    <div class="text-justify description mt-2 mx-3">
                        <CollapsibleText 
                            :content="dataObj.description" 
                            :lines="2"
                        />
                    </div>
                    <div class="mt-2 px-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="fw-bold text-uppercase fs-14 hint muted">
                                Details
                            </div>
                            <Icon name="emojione-v1:rosette" />
                        </div>
                        <div>
                            <template v-for="(value,key) in dataObj">
                                <div class="d-flex align-items-center justify-content-between py-2 details"
                                    v-if="['name', 'symbol', 'standard', 'contract'].includes(key)"
                                >
                                    <div class="text-capitalize key text-start fw-medium">
                                        {{ key }}
                                    </div>
                                    
                                    <div v-if="key == 'contract'" class='value text-break text-end'>
                                        {{ value }}
                                    </div>
                                    <div v-else class='value text-break text-end'>{{ value }}</div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </loading-view>
        </div>
    </WalletLayout>
</template>
<style lang="scss" scoped>
.collection-preview {
    max-height: 300px;
    max-height: 45vh;
    max-width: 100%;
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