<script setup>
import { onBeforeMount, ref } from 'vue';
import { useNetworks } from '../../../composables/useNetworks';
import InfiniteScroll from '../../common/InfiniteScroll.vue';
import NFTCollectionItem from '../NFTCollectionItem.vue';
//import Utils from '../../../classes/Utils';

const networks  = useNetworks()
const activeNetInfo = ref()
const queryParams = ref({})
const key = ref(Date.now())
const initialized = ref(true)
var searchQuery = ""

onBeforeMount(async () => {
    await initialize()
})

const initialize = async () => {
    activeNetInfo.value = await networks.getActiveNetworkInfo()
    queryParams.value   = { keyword: "", chainId: activeNetInfo.value.chainId }
    initialized.value   = true
}

const onSearch = async (keyword) => {

    searchQuery = keyword.trim();

    window.setTimeout(() => {
        keyword = keyword.trim()

        if(searchQuery != keyword) return;
        
        //console.log("keyword: ==>", keyword)
        
        queryParams.value = {
            keyword,
            chainId: activeNetInfo.value.chainId
        }

        key.value = Date.now()
        
    }, 1500)
}
</script>
<template>
    <div class="px-3" v-if="initialized">
        <div class="import-search-form">
            <SearchForm
                :dataToFilter="null"
                :filterKeys="[]"
                @change="onSearch"
            />
        </div>
        <div class="pb-2">
            <InfiniteScroll 
                uri="/token-import/nft-collections"
                :queryParams="queryParams"
                resultsDataKey=""
                :renderer="NFTCollectionItem"
                :key="key"
                containerClass="d-flex flex-wrap justify-content-center"
            />
        </div>
    </div>
</template>