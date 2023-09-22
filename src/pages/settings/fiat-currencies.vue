<script setup>
import { onBeforeMount, ref } from 'vue'
import Utils from '../../classes/Utils';
import { useSettings } from "../../composables/useSettings"
import EventBus from '../../classes/EventBus';

const { settings, saveSettings } = useSettings()

const isLoading = ref(false)
const fiatCurrencies = ref([])
const dataToRender = ref([])
const pageError = ref("")

onBeforeMount(() => {
    initiatialize()
})

const initiatialize = async () => {
    try{

        isLoading.value = true 
        let dataObj = (await import("/data/fiat-currencies.js?url")).default;

        let pDataArray = []

        for(let item of Object.entries(dataObj)){
           let [symbol, name] = item 
           pDataArray.push({ symbol, name })
        }

        fiatCurrencies.value = pDataArray
    }catch(e){
        Utils.logError("fiat-currencies:", e)
        pageError.value = Utils.generalErrorMsg
    } finally{
        isLoading.value = false 
    }
}

const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}

const isDefaultCurrency = (symbol) => {
    let def = (settings.value.defaultCurrency || "USD")
    return  (def == symbol)
}

const currencyItemClick = async (item) => {
   
    let resultStatus = await saveSettings("defaultCurrency", item.symbol)
   
   if(resultStatus.isError()){
     return Utils.errorAlert(resultStatus.getMessage())
   }

   Utils.toast(`Default currency set to ${item.symbol}`)

   EventBus.emit("update-balance");
}
</script>
<template>
    <WalletLayout
        title="Fiat Currency" 
        :page-error="pageError"
        :showNav="false"
    >   

        <NativeBackBtn url="/settings" />

        <div class="w-400 mb-5">
            <div class="d-flex p-2 justify-content-between align-items-center flex-nowrap">
                <div class="fw-semibold fs-6 pe-2">Fiat Currency</div>
                <div class="fw-medium d-flex">
                    <div>Default:</div>
                    <div class="text-primary fw-semibold ms-2">
                        {{ (settings.defaultCurrency || "USD").toUpperCase() }}
                    </div>
                </div>
            </div>
            <loading-view :isLoading="isLoading">
                <div class="my-2 mx-2">
                    <search-form 
                        placeholder="Search"
                        @change="onSearch"
                        :dataToFilter="fiatCurrencies"
                        :filterKeys="['name', 'symbol']"
                        :mode="{start: true, end: false }"
                    />
                </div>
                <div class="h-divider mt-3"></div>
                <nav class="list-group list-group-flush mt-2">
                    <template v-for="(item, index) in dataToRender">
                        <a href="#" @click.prevent="currencyItemClick(item)"
                            class="list-group-item py-3 fw-medium d-flex justify-content-between align-items-center"
                        >
                            <div>
                                {{ item.name }} 
                                <span class='muted hint ms-2'>{{ item.symbol.toUpperCase() }}</span>
                            </div>
                            <Icon 
                                name="clarity:check-line" 
                                :size="24"
                                class="me-2 text-primary"
                                v-if="isDefaultCurrency(item.symbol)"
                            />
                        </a>
                    </template>
                </nav>
            </loading-view>
        </div>

    </WalletLayout>
</template>