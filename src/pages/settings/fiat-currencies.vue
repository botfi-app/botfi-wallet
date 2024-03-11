<script setup>
import { onBeforeMount, ref } from 'vue'
import Utils from '../../classes/Utils';
import { useSettings } from "../../composables/useSettings"
import EventBus from '../../classes/EventBus';
import currencies from '../../data/currencies';

const { settings, saveSettings } = useSettings()

const initialized = ref(false)
const isLoading = ref(false)
const fiatCurrencies = ref([])
const dataToRender = ref([])
const pageError = ref("")

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {
    try{

        isLoading.value = true 
        let dataObj = currencies

        let pDataArray = []

        for(let symbol in dataObj){
            let name = dataObj[symbol]
           pDataArray.push({ symbol, name })
        }

        fiatCurrencies.value = pDataArray
        initialized.value = true 

    }catch(e){
        Utils.logError("fiat-currencies:", e)
        pageError.value = Utils.generalErrorMsg
    } finally{
        isLoading.value = false 
    }
}

const onSearch = async (keyword, filteredData) => {
    //console.log("filteredData===>", filteredData)
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
        title="" 
        :page-error="pageError"
        :showNav="false"
        v-if="initialized"
    >   
        <div class="w-800 mb-5">
            <div class="d-flex p-2 justify-content-between align-items-center flex-nowrap">
          
                <div class="center-vh">
                    <NativeBackBtn url="/settings"  />
                    <div class="fw-semibold fs-6 pe-2">Fiat Currency</div>
                </div>
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