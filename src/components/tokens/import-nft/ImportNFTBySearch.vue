<script setup>
import { onBeforeMount, ref } from 'vue';
import { useNetworks } from '../../../composables/useNetworks';
import InfiniteScroll from '../../common/InfiniteScroll.vue';
import NFTCollectionItem from '../NFTCollectionItem.vue';

const keyword   = ref("")
const initialData = ref([])
const searchResults = ref([]) 
const networks  = useNetworks()
const activeNetInfo = ref()
const queryParams = ref({})
const key = ref(Date.now())
const initialized = ref(true)

onBeforeMount(async () => {
    await initialize()
})


const initialize = async () => {
    activeNetInfo.value = await networks.getActiveNetworkInfo()
    queryParams.value   = { keyword: keyword.value, chainId: activeNetInfo.value.chainId }
    initialized.value   = true
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