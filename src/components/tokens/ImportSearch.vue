<script setup>
import { ref } from 'vue';
import Utils from '../../classes/Utils';
import Http from '../../classes/Http';
import { useNetworks } from '../../composables/useNetworks';

const keyword   = ref("")
const isLoading = ref(false)
const pageError = ref("")
const dataArray = ref([])
const networks  = useNetworks()

const fetchData = async () => {
    try {

        let activeNetInfo = await networks.getActiveNetworkInfo()

        let params = { keyword: keyword.value, chainId: activeNetInfo.chainId }
        
        isLoading.value = true 
        
        let resultStatus = await Http.getApi("/token-import/tokens", params)

    } catch(e){
        console.log("ImportSearch#initialize:", e)
        pageError.value = Utils.generalErrorMsg
    } finally {
        isLoading.value = false
    }
}

const onSearch = async (_keyword) => {
    keyword.value = _keyword
}
</script>
<template>
    <div class="px-3">
        <div class="mt-3">
            <SearchForm
                :dataToFilter="null"
                :filterKeys="[]"
                @change="onSearch"
            />
        </div>
    </div>
</template>