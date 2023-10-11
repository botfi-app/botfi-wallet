<script setup>
import { useTokens } from '../../composables/useTokens'
import Utils from '../../classes/Utils';
import { useSettings } from '../../composables/useSettings'
import { onBeforeMount, ref, watch } from 'vue';
import { useWalletStore } from '../../store/walletStore';
import { useRouter } from 'vue-router';
import Avatar from '../common/Avatar.vue';

const { tokens } = useTokens()
const { fetchSettings } = useSettings()
const { activeWallet } = useWalletStore()
const router = useRouter()
const nativeTokenInfo = ref(null)
const defaultCurrency = ref("usd")

onBeforeMount(() => {
    processNativeToken()
})

const processNativeToken = async() => {

    let _tokens = tokens.value

    if(!_tokens || _tokens == null) return;


    let defaultBalanceInfo = { balanceDecimal: 0, balanceFiat: {} }

    let settings  = await fetchSettings()
    defaultCurrency.value = (settings.defaultCurrency || "usd").toLowerCase()

    nativeTokenInfo.value = _tokens[Utils.nativeTokenAddr]

    if(nativeTokenInfo.value == null) return

    if(!("balanceInfo" in nativeTokenInfo.value) || 
       nativeTokenInfo.value.balanceInfo == null || 
       Object.keys(nativeTokenInfo.value.balanceInfo).length == 0
    ) {
        nativeTokenInfo.value.balanceInfo = defaultBalanceInfo
    }
 
}

watch(tokens, () => {
    processNativeToken()
}, { deep: true })


</script>
<template>
     <div class="home-balance-card rounded-lg mt-3" 
        v-if="nativeTokenInfo != null"
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
                    {{ nativeTokenInfo.balanceInfo.balanceDecimal }} 
                </h2>
                <h3 class="m-0 p-0 ms-1">
                    {{ nativeTokenInfo.symbol }}
                </h3>
            </div>
            <div v-if="defaultCurrency in  nativeTokenInfo.balanceInfo.balanceFiat">
                <div class="d-flex fs-6 text-light text-center center-vh mb-2">
                    <div class="me-1">
                        {{ nativeTokenInfo.balanceInfo.balanceFiat[defaultCurrency]  }}
                    </div>
                    <div>{{ defaultCurrency.toUpperCase() }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.home-balance-card {
    padding: 0px; 
    margin: 0px;
    background: var(--bs-body-bg-dark-5);
    color: var(--bs-body-color);
}
</style>