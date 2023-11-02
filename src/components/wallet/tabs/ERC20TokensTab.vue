<script setup>
import { nextTick, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useTokens } from '../../../composables/useTokens'
import Image from '../../common/Image.vue';
import { useSettings } from '../../../composables/useSettings'
import EventBus from '../../../classes/EventBus';
import Utils from '../../../classes/Utils';

const props = defineProps({
    limit: { type: null, default: null },
    hasSearch: { type: Boolean, default: false },
    enableViewAllBtn: { type: Boolean, default: false }
})

const { fetchSettings } = useSettings()
const { tokens, removeToken, updateBalances  } = useTokens()
const defaultCurrency = ref("usd")
const initialized = ref(false)
//const tokensData = ref({})
const dataToRender  = ref({})
const dataState = ref(Date.now())
const tokensData = ref({})

onBeforeMount(() => {
   initialize()
})

watch(tokens, () => {
    processTokens()

}, { deep: true })

const processTokens = () => {

    let limit = props.limit

    if(limit > 0){
        tokensData.value = Object.fromEntries(
            Object.entries(tokens.value).slice(0, limit+1)
        )
    } else {
        tokensData.value = tokens.value
    }

    dataState.value = Date.now()
}

const initialize = async () => {
    let settings  = await fetchSettings()
    defaultCurrency.value = (settings.defaultCurrency || "usd").toLowerCase()

    processTokens()
    dataToRender.value = tokensData.value

    initialized.value = true
}

const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}


const reloadData = async () => {
    let loader = Utils.loader("Updating Balances")
    await updateBalances(null, true)
    loader.close()
}

const doRemoveToken = async (token) => {
    
    let loader;

    try {

        if(token.contract == Utils.nativeTokenAddr){
            return Utils.errorAlert(`Native token (${token.symbol}) cannot be removed`)
        }

        let html = `${token.name} (${token.symbol.toUpperCase()}) will be removed`

        let action =   await Utils.getSwal().fire({
                            showCancelButton:   true,
                            confirmButtonText:  'Confirm',
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
                tokensData.value = _tokensData
                dataState.value = Date.now()
            })
        }
    } catch(e){
        Utils.logError(`TokenBalances#removeToken:`, e)
        Utils.errorAlert(Utils.generalErrorMsg)
    } finally {
        if(loader) loader.close()
    }
}
</script>

<template>
    <div v-if="initialized" :key="dataState">
             
        <div class="mx-2 px-1 mt-2">
            <div class="py-3">
                <div class="d-flex align-items-center justify-content-center">
                    <search-form 
                        placeholder="Search"
                        @change="onSearch"
                        :dataToFilter="tokensData"
                        :filterKeys="['name', 'contract', 'symbol']"
                        :mode="{start: true, end: true }"
                        
                        class="flex-grow-1"
                    />
                    <button @click.prevent="reloadData"
                        class="btn btn-none text-success rounded-circle btn-sm mx-2 p-0"
                    >
                        <Icon name="solar:refresh-bold" :size="28" />
                    </button>
                    <router-link to="/tokens/import-erc20?ref=wallet" 
                        class="btn btn-none text-primary rounded-circle btn-sm p-0"
                    >
                        <Icon name="gala:add" :size="28" />
                    </router-link>
                </div>
            </div>
            <template v-for="token in dataToRender">
                <div class="d-flex align-items-center no-select justify-content-between">
                    <div @click.prevent="$router.push(`/tokens/${token.contract}`)"
                        class="d-flex m-pointer justify-content-between align-items-center py-1 my-2 flex-grow-1"
                    >
                        <div class="d-flex">
                            <Image
                                :src="token.image"
                                :placeholder="token.symbol"
                                :width="28"
                                :height="28"
                                class="rounded-circle shadow"
                            />
                            <div class="ps-2 m-pointer no-select">
                                <div class="fw-medium">{{ token.symbol.toUpperCase() }}</div>
                                <div class="fs-12 hint muted fw-semibold monospace">
                                    {{ token.name }}
                                </div>
                            </div>
                        </div>
                        <div v-if="('balanceInfo' in  token)" 
                            class="d-flex flex-column align-items-end m-pointer"
                        >
                            <div class="d-flex">
                                <div class="me-1">{{ token.balanceInfo.balanceDecimal }}</div>
                                <div>{{ token.symbol.toUpperCase() }}</div>
                            </div>
                            <div v-if="'balanceFiat' in  token.balanceInfo &&
                                typeof token.balanceInfo.balanceFiat === 'object' && 
                                defaultCurrency in  token.balanceInfo.balanceFiat"
                            >
                                <div class="d-flex fs-12 hint muted fw-semibold monospace">
                                    <div class="me-1">
                                        {{ Utils.formatFiat(token.balanceInfo.balanceFiat[defaultCurrency])  }}
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
                                    <a  @click.prevent="doRemoveToken(token)"
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

            <div v-if="props.enableViewAllBtn && Object.keys(tokensData).length > 0">
                <div class="d-flex mt-2 mb-3 me-3 justify-content-end">
                    <router-link to="/tokens#t-erc20s" 
                        class="btn btn-outline-primary rounded-pill shadow"
                    >
                        <div class="d-flex align-items-center">
                            <div class="me-2">View All</div>
                            <Icon name="solar:arrow-right-line-duotone" />
                        </div>
                    </router-link>
                </div>
            </div>

        </div>
    </div>
</template>