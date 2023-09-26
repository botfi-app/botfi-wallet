<script setup>
import { nextTick, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useTokens } from '../../composables/useTokens'
import Image from '../common/Image.vue';
import { useSettings } from '../../composables/useSettings'
import EventBus from '../../classes/EventBus';
import Utils from '../../classes/Utils';

const props = defineProps({
    limit: { type: null, default: null },
    hasSearch: { type: Boolean, default: false }
})

const { fetchSettings } = useSettings()
const { getTokens, removeToken  } = useTokens()
const defaultCurrency = ref("usd")
const initialized = ref(false)
const tokensData = ref({})
const dataToRender  = ref({})
const dataState = ref(Date.now())


onBeforeMount(() => {
   initialize()
})

const initialize = async () => {
    let settings  = await fetchSettings()
    defaultCurrency.value = (settings.defaultCurrency || "usd").toLowerCase()

    tokensData.value = await getTokens()
    dataToRender.value = tokensData.value

    EventBus.on("balance-updated", (tdata) => {
        nextTick(() => {
            tokensData.value = tdata
            dataState.value = Date.now()
        })
    })

    initialized.value = true
}

const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}

onBeforeUnmount(() => {
    EventBus.off("balance-updated");
})

const doRemoveToken = async (token) => {
    
    let loader;

    try {

        if(token.contract == Utils.nativeTokenAddr){
            return Utils.errorAlert(`Native token (${token.symbol}) cannot be removed`)
        }

        let html = `${token.name} (${token.symbol.toUpperCase()}) will be removed`

        let action =   await Utils.getSwal().fire({
                            showCancelButton: true,
                            confirmButtonText: 'Confirm',
                            denyButtonText:     'Cancel',
                            html,
                            title: "Confirm Action",
                        })

        if(!action.isConfirmed) return;
                        
        loader = Utils.loader(`Removing ${token.name} (${token.symbol.toUpperCase()})`)

        let resultStatus = await removeToken(token)

        if(resultStatus.isError()){
            return Utils.errorAlert(resultStatus.getMessage())
        }   
        
        Utils.toast(`Token removed`)

        let _tokensData = resultStatus.getData() || null 

        if(_tokensData != null){
            nextTick(() => {
                tokensData.value = _tokensDatas
                dataState.value = Date.now()
            })
        }
    } catch(e){
        Utils.logError(`TokenBalances#removeToken:`, e)
        Utils.errorAlert(Utils.generalErrorMsg)
    }
}
</script>

<template>
    <div v-if="initialized">
        <div v-if="props.hasSearch">      
            <div class="h-divider mt-3" />
            <div class="px-3 pt-3">
                <search-form 
                    placeholder="Search"
                    @change="onSearch"
                    :dataToFilter="tokensData"
                    :filterKeys="['name', 'contract', 'symbol']"
                    :mode="{start: true, end: true }"
                    :key="dataState"
                />
            </div>
            <div class="h-divider my-3 mx-2" />
        </div>
        <div class="mx-2 px-1">
            <template v-for="token in dataToRender">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex justify-content-between align-items-center py-1 my-2 flex-grow-1">
                        <div class="d-flex">
                            <Image
                                :src="token.image"
                                :placeholder="token.symbol"
                                :width="28"
                                :height="28"
                                class="rounded-circle shadow"
                            />
                            <div class="ps-2">
                                <div class="fw-medium">{{ token.symbol.toUpperCase() }}</div>
                                <div class="fs-12 hint muted fw-semibold monospace">
                                    {{ token.name }}
                                </div>
                            </div>
                        </div>
                        <div v-if="('balanceInfo' in  token)" 
                            class="d-flex flex-column align-items-end"
                        >
                            <div class="d-flex">
                                <div class="me-1">{{ token.balanceInfo.balanceDecimal }}</div>
                                <div>{{ token.symbol.toUpperCase() }}</div>
                            </div>
                            <div v-if="defaultCurrency in  token.balanceInfo.balanceFiat">
                                <div class="d-flex fs-12 hint muted fw-semibold monospace">
                                    <div class="me-1">
                                        {{ token.balanceInfo.balanceFiat[defaultCurrency]  }}
                                    </div>
                                    <div>{{ defaultCurrency.toUpperCase() }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ps-2">
                        <div class="btn-group dropdown">
                            <a href="#" 
                                class="px-1"
                                type="button" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                            >
                                <Icon name="ri:more-2-fill" />
                            </a>
                            <ul class="dropdown-menu shadow rounded py-0 my-0">
                                <li>
                                    <a  @click.prevent="removeToken(token)"
                                        class="dropdown-item py-3" 
                                        href="#"
                                    >
                                        <div class="d-flex align-items-center">
                                            <Icon name="mdi:delete" class="text-danger" />
                                            <div class="ms-1">Remove</div>
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>