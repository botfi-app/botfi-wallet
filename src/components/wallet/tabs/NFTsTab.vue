<script setup>
import { nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useTokens } from '../../../composables/useTokens'
import Image from '../../common/Image.vue';
import { useSettings } from '../../../composables/useSettings'
import EventBus from '../../../classes/EventBus';
import Utils from '../../../classes/Utils';

const props = defineProps({
    limit: { type: null, default: null }
})

const { fetchSettings } = useSettings()
const { getTokens, removeToken  } = useTokens()
const defaultCurrency = ref("usd")
const initialized = ref(false)
const nftsData = ref({})
const dataToRender  = ref({})
const dataState = ref(Date.now())

onBeforeMount(() => {
    initialize()
})

const initialize = () => {

    initialized.value = true
}

const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
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
                        :dataToFilter="nftsData"
                        :filterKeys="['name', 'contract', 'symbol']"
                        :mode="{start: true, end: true }"
                        :key="dataState"
                        class="flex-grow-1"
                    />
                    <button @click.prevent="reloadData"
                        class="btn btn-none text-success rounded-circle btn-sm mx-2 p-0"
                    >
                        <Icon name="solar:refresh-line-duotone" :size="32" />
                    </button>
                    <router-link to="/tokens/import-nft?ref=wallet&type=nft" 
                        class="btn btn-none text-primary rounded-circle btn-sm p-0"
                    >
                        <Icon name="solar:add-circle-line-duotone" :size="32" />
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>