<script setup>
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useTokens } from '../../../composables/useTokens'
import ImportedNFTCard from "../../tokens/ImportedNFTCard.vue"

const props = defineProps({
    limit: { type: null, default: null }
})

const { getNFTs,updateOnChainNFTData  } = useTokens()
const initialized = ref(false)
const dataToRender  = ref({})
const dataState = ref(Date.now())
const nftItems = ref({})
let updateTimer = null

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {

    updateOnChainNFTData()
    nftItems.value = await getNFTs(props.limit)

    updateTimer = window.setInterval(async () => {
        updateOnChainNFTData()
        nftItems.value = await getNFTs(props.limit)
    }, 35_000)

    initialized.value = true
}

const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}

onBeforeUnmount(() => {
    if(updateTimer) clearInterval(updateTimer)
})

</script>
<template>
     <div v-if="initialized">      
        <div class="mx-2 px-1 mt-2">
            <div class="py-3">
                <div class="d-flex align-items-center justify-content-center">
                    <search-form 
                        placeholder="Search"
                        @change="onSearch"
                        :dataToFilter="nfts"
                        :filterKeys="['name', 'collection', 'symbol']"
                        :mode="{start: true, end: true }"
                        :key="dataState"
                        class="flex-grow-1"
                    />
                    <button @click.prevent="reloadData"
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
                <div class="d-flex flex-wrap justify-content-center">
                    <template v-for="(item, id) in nftItems">
                        <ImportedNFTCard data="item" />
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>