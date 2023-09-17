<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';
import Http from '../../classes/Http';
import { useNetworks } from '../../composables/useNetworks';
import Image from '../common/Image.vue';
import { useTokens } from '../../composables/useTokens';

const keyword   = ref("")
const isLoading = ref(false)
const errorMsg = ref("")
const initialData = ref([])
const searchResults = ref([]) 
const networks  = useNetworks()
const tokensCore = useTokens()
const initialized = ref(false)
const activeNetInfo = ref()

onBeforeMount(async () => {
    await fetchData()
    initialData.value = searchResults.value
    initialized.value = true 
})

const fetchData = async () => {
    try {

        activeNetInfo.value = await networks.getActiveNetworkInfo()

        let params = { keyword: keyword.value, chainId: activeNetInfo.value.chainId }

        isLoading.value = true 
        
        let resultStatus = await Http.getApi("/token-import/tokens", params)

        if(resultStatus.isError()){
            errorMsg.value = resultStatus.getMessage()
            return false;
        }

        searchResults.value = resultStatus.getData()

    } catch(e){
        console.log("ImportSearch#initialize:", e)
        pageError.value = Utils.generalErrorMsg
    } finally {
        isLoading.value = false
    }
}

const onSearch = async (_keyword) => {

    _keyword = _keyword.trim()
    keyword.value = _keyword

    if(_keyword.trim() == ""){
        searchResults.value = initialData.value
    } else {
        fetchData()
    }
}

const onItemSelect = async (item) => {
    
    let loader;

    try {

        console.log(item)
        let chainId = activeNetInfo.value.chainId 
        let contractAddr = item.contracts[chainId]

        loader = Utils.loader("Verifying contract onchain")

        let verifyStatus = await tokensCore.getERC20TokenInfo(contractAddr)

        if(verifyStatus.isError()){
           return Utils.errorAlert(verifyStatus.getMessage())
        }

        console.log(verifyStatus)
    } catch(e){ 
        console.log(e, e.stack)
        Utils.errorAlert(Utils.generalErrorMsg)
    } finally {
        if(loader) loader.close()
    }
}
</script>
<template>
    <div class="px-3">
        <div class="import-search-form">
            <SearchForm
                :dataToFilter="null"
                :filterKeys="[]"
                @change="onSearch"
            />
        </div>
        <div class="pb-2">
            <loading-view :isLoading="isLoading">
                <ul class="list-group rounded">
                    <template v-for="(item, index) in searchResults" :key="index">
                        <li class="list-group-item py-3" @click.prevent="onItemSelect(item)">
                            <div class="d-flex">
                                <Image 
                                    :src="item.image" 
                                    :placeholder="item.symbol[0].toUpperCase()"
                                    :width="24"
                                    :height="24"
                                    class="rounded-circle shadow-lg me-2"
                                />
                                <div>{{ item.name }}</div>
                                <div class="ms-2 muted hint">
                                    {{ item.symbol.toUpperCase() }}
                                </div>
                            </div> 
                        </li>
                    </template>
                </ul>
            </loading-view>
        </div>
    </div>
</template>