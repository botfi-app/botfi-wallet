<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';
import { useWalletStore } from '../../store/walletStore';
import Modal from './Modal.vue';
import { useNetworks } from '../../composables/useNetworks';


const props = defineProps({
    showAddr: { type: Boolean, default: true },
    netMaxWidth: { type: null, default: '65px'}
})

const walletStore = useWalletStore()
const { activeWallet } = walletStore
const { isNetReady, activeNetwork } = useNetworks()
const pageError = ref("") 
const isPageLoading = ref(false)
const modalId = ref("d-net-acct-modal"+Date.now())
const userInfo = ref({})
const name = ref("")

const initialize = async => {
    userInfo.value =  botUtils.getUserInfo() || {}
    let username = (userInfo.value.username || "").trim()
    name.value = (username.length > 0) ? '@'+username : userInfo.firstName; 
}

onBeforeMount(() => {
    initialize()
})

const copyAddr = async () => { 
    Utils.copyText({ 
        text: activeWallet.address, 
        showToast: true,
        successText: "Address copied",
    })
}

</script>
<template>
    
    <Modal
        id="acctNetSelectModal"
        :title="`${name}`"
        :has-header="true"
        :has-footer="false"
    >
        <template #body>
            <loading-view :isLoading="isPageLoading">
                <div class="pt-2 pb-3">
                    <div class="p-3 text-center hint text-muted" v-if="pageError != ''">
                        <div>{{ pageError }}</div>
                        <div>
                            <button @click.prevent="initialize" 
                                class='btn btn-lg btn-success px-4 py-2 rounded-pill mt-4'
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                    <div v-else class="p-3 pb-2">
                        <div v-if="activeWallet != null && showAddr">
                            <div class="d-flex justify-content-between align-items-center">
                                <label class="fw-bold text-opacity-50">Wallet</label>
                                <button class="btn btn-none text-primary">Change</button>
                            </div>
                            <div class="
                                active-wallet-addr 
                                p-2 mt-2 border 
                                rounded 
                                center-vh
                                no-underline"
                            >   
                                <router-link  
                                    :to="`/wallet/addresses?r=${Utils.getUriPath()}`" 
                                    class="btn btn-none text-start text-break px-0 fs-15"
                                >
                                    <span>{{ activeWallet.address }}</span>
                                    <span class="ms-2 fs-12 muted hint font-monospace"
                                        v-if="activeWallet.name != '' && activeWallet.address != activeWallet.name"
                                    >
                                        {{ activeWallet.name }}
                                    </span>
                                </router-link>
                                <button class="btn btn-primary p-2 rounded ms-2" @click.prevent="copyAddr">
                                    <Icon name='solar:copy-bold-duotone' :size="24" />
                                </button>
                            </div>
                        </div>
                        <div class="mt-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <label class="fw-bold text-opacity-50">Network</label>
                                <router-link  
                                    :to="`/networks?r=${Utils.getUriPath()}`" 
                                    class="btn btn-none text-primary"
                                >
                                    Change
                                </router-link>
                            </div>
                            <router-link
                                class="
                                    active-wallet-addr 
                                    p-2 mt-2 border 
                                    rounded d-flex 
                                    justify-content-between  
                                    align-items-center 
                                    no-underline
                                "
                                v-if="isNetReady"
                                :to="`/networks?r=${Utils.getUriPath()}`"
                            >
                                <div class="text-break ">
                                    {{ activeNetwork.name }} ( {{ activeNetwork.chainId }} )
                                </div>
                                <button class="btn btn-secondary p-2 rounded ms-2" >
                                    <Image 
                                        :width="26" 
                                        :height="26" 
                                        class="rounded-circle"
                                        :src="activeNetwork.icon" 
                                        :placeholder="activeNetwork.name"
                                    />
                                </button>
                            </router-link>
                        </div>
                        <div class="mt-4">
                            <button data-bs-dismiss="modal" class="btn btn-primary full-width rounded-pill">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </loading-view>
        </template>
    </Modal>
</template>
<style lang="scss">
.active-wallet-addr {
    width: 100%;    
    height: 70px;
}
</style>