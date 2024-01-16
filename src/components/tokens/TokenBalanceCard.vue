<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { useTokens } from '../../composables/useTokens'
import Utils from '../../classes/Utils';
import { useSettings } from '../../composables/useSettings'
import { onBeforeMount, ref, watch } from 'vue';
import { useWalletStore } from '../../store/walletStore';
import { useRouter } from 'vue-router';
import DepositAddressModal from "../modals/DepostAddressModal.vue"

const props = defineProps({
    tokenAddress: { type: String, required: true }
})

const tokenAddr = ref(props.tokenAddress)
const tokenInfo = ref(null)
const { tokens } = useTokens()
const { fetchSettings } = useSettings()
const { activeWallet } = useWalletStore()
const router = useRouter()
const defaultCurrency = ref("usd")
const title = ref("Deposit Address")

const actionArr = ref([
    { 
        text: "Send", 
        icon: "iconoir:arrow-tr", 
        onClick: () => router.push(`/tokens/${props.tokenAddress}/transfer`),
        attr: {}
    },
    { 
        text: "Recieve", 
        icon: "iconoir:arrow-br", 
        onClick: "",
        attr: { "data-bs-toggle": "modal", "data-bs-target": "#deposit-addr-modal" }
    },
    { text: "Swap", 
      icon: "streamline:interface-arrows-reload-2-arrows-load-arrow-sync-square-loading-reload-synchronize", 
      onClick: () => router.push(`/swap?from=${props.tokenAddress}`),
      attr: {}
    },
])

onBeforeMount(() => {
    processToken()
})

const processToken = async() => {

    let _tokens = tokens.value

    if(!_tokens || _tokens == null) return;


    let defaultBalanceInfo = { balanceDecimal: 0, balanceFiat: {} }

    let settings  = await fetchSettings()
    defaultCurrency.value = (settings.defaultCurrency || "usd").toLowerCase()

    tokenInfo.value = _tokens[props.tokenAddress]

    if(tokenInfo.value == null) return

    if(!("balanceInfo" in tokenInfo.value) || 
        tokenInfo.value.balanceInfo == null || 
        Object.keys(tokenInfo.value.balanceInfo).length == 0
    ) {
        tokenInfo.value.balanceInfo = defaultBalanceInfo
    }
    
    title.value = ` <div class='center-vh text-truncate'>
                        <div>${tokenInfo.value.name}</div>
                        <div class='ms-1 hint'>
                            ${tokenInfo.value.symbol}
                        </div>
                    </div>
                    `
}

watch(tokens, () => {
    processToken()
}, { deep: true })


</script>
<template>
    <div class="token-balance-card rounded-lg mt-3" 
        v-if="tokenInfo != null"
    >
        <div class="rounded-lg px-2 pb-3">
            <WalletSelect 
                btnClass="btn-none border-none py-2" 
                :showArrow="true"
            />
            <div class="h-divider mb-3" />
            <div class="text-center text-light m-0 p-0 d-flex center-vh mb-1">
                <h2 class="m-0 p-0">
                    {{ Utils.formatCrypto(tokenInfo.balanceInfo.balanceDecimal, 4) }} 
                </h2>
                <h3 class="m-0 p-0 ms-1">
                    {{ tokenInfo.symbol }}
                </h3>
            </div>
            <div v-if="defaultCurrency in  tokenInfo.balanceInfo.balanceFiat">
                <div class="d-flex fs-6 text-light text-center center-vh mb-2">
                    <div class="me-1">
                        {{  Utils.formatFiat(tokenInfo.balanceInfo.balanceFiat[defaultCurrency])  }}
                    </div>
                    <div>{{ defaultCurrency.toUpperCase() }}</div>
                </div>
            </div>

            <div class="d-flex align-items-center justify-content-center actions mt-3">
                <template v-for="(item, index) in actionArr" :key="index">
                    <div class="text-center">
                        <button @click.prevent="item.onClick"
                            class="btn btn-primary p-0 rounded-circle center-vh"
                            v-bind="item.attr"
                        >
                            <Icon :name="item.icon" class="text-light" />
                        </button>
                        <div class="text-center text fs-14 hint fw-semibold">
                            {{ item.text }}
                        </div>
                    </div>
                </template>
            </div>
            <DepositAddressModal 
                :title="title"
                :address="activeWallet.address"
                :logo="Utils.getTokenIconUrl(tokenInfo.symbol)"
            />
        </div>
    </div>
</template>
<style lang="scss">
.actions {
    >div {
        margin: 0px 10px;
        display:flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
    .btn {
        width: 40px;
        height: 40px;
    }
}
</style>