<script setup>
import { useTokens } from '../../composables/useTokens'
import Utils from '../../classes/Utils';
import { useSettings } from '../../composables/useSettings'
import { onBeforeMount, ref, watch } from 'vue';
import { useWalletStore } from '../../store/walletStore';
import { useRouter } from 'vue-router';
import Avatar from '../common/Avatar.vue';

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

const actionArr = ref([
    { text: "Send", icon: "iconoir:arrow-tr", url: "" },
    { text: "Recieve", icon: "iconoir:arrow-br", url: "" },
    { text: "Swap", 
      icon: "streamline:interface-arrows-reload-2-arrows-load-arrow-sync-square-loading-reload-synchronize", 
      url: "" 
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
            <div v-if="activeWallet" class="p-3 pb-2">
                <button class="btn py-2 btn-none rounded w-full d-block" 
                    v-if="activeWallet"
                    data-bs-toggle="modal" 
                    @click.prevent="router.push(`/wallet/addresses?r=${Utils.getUriPath()}`)"
                >
                    <div class="d-flex align-items-center justify-content-between fs-16">
                        <div class="d-flex align-items-center">
                            <Avatar 
                                :name="activeWallet.address" 
                                :square="true" 
                                :size="24" 
                                variant="ring"
                                class="rounded me-2"
                            />
                            <div class="text-light me-2 fw-normal text-truncate flex-grow-1">
                                {{ activeWallet.name }}
                            </div>
                        </div>

                        <div class="font-monospace text-primary">
                            {{  Utils.maskAddress(activeWallet.address, 6, 6)  }}
                        </div>

                        <Icon name="akar-icons:chevron-right" 
                            class="ms-1 text-light" 
                        />
                    </div>
                </button>
            </div> 
            <div class="h-divider mb-3" />
            <div class="text-center text-light m-0 p-0 d-flex center-vh mb-1">
                <h2 class="m-0 p-0">
                    {{ tokenInfo.balanceInfo.balanceDecimal }} 
                </h2>
                <h3 class="m-0 p-0 ms-1">
                    {{ tokenInfo.symbol }}
                </h3>
            </div>
            <div v-if="defaultCurrency in  tokenInfo.balanceInfo.balanceFiat">
                <div class="d-flex fs-6 text-light text-center center-vh mb-2">
                    <div class="me-1">
                        {{ tokenInfo.balanceInfo.balanceFiat[defaultCurrency]  }}
                    </div>
                    <div>{{ defaultCurrency.toUpperCase() }}</div>
                </div>
            </div>

            <div class="d-flex align-items-center justify-content-center actions mt-3">
                <template v-for="(item, index) in actionArr" :key="index">
                    <div class="text-center">
                        <button class="btn btn-primary p-0 rounded-circle center-vh">
                            <Icon :name="item.icon" class="text-light" />
                        </button>
                        <div class="text-center text fs-14 hint fw-semibold">
                            {{ item.text }}
                        </div>
                    </div>
                </template>
            </div>
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