<script setup>
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import Avatar from '../common/Avatar.vue';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    btnClass: { type: String, default: ''}
})

const router = useRouter()
const walletStore = useWalletStore()
const { activeWallet } = walletStore

let btnClass = ref("btn-outline-primary rounded")

onBeforeMount(() => {
    if(props.btnClass != ''){
        btnClass.value = props.btnClass
    }
})

const openWallets = () => {
    router.push(`/wallet/addresses?r=${Utils.getUriPath()}`)
}
</script>
<template>
    <div class="w-full">
        <button :class="`btn py-2 d-block addr-select-btn w-full ${btnClass}`" 
            v-if="activeWallet"
            data-bs-toggle="modal" 
        >
            <div class="d-flex align-items-center justify-content-between fs-16">

                <div @click.prevent="openWallets"
                    class="d-flex align-items-center mw-50vw"
                >
                    <Avatar 
                        :name="activeWallet.address" 
                        :square="true" 
                        :size="24" 
                        variant="ring"
                        class="rounded me-2"
                    />
                    <div class="text-dark me-2 fw-normal text-truncate flex-grow-1">
                        {{ activeWallet.name }}
                    </div>
                </div>

                <div   @click.prevent="openWallets"
                    class="font-monospace"
                >
                    {{  Utils.maskAddress(activeWallet.address, 6, 6)  }}
                </div>

                <div>
                    <CopyBtn 
                        :text="activeWallet.address"
                        btnClasses="btn btn-sm p-0 btn-primary rounded copybtn" 
                        :showToast="true"
                        successText="Address Copied"
                    />
                </div>
            </div>
        </button>
    </div>
</template>
<style scoped>
.addr-select-btn:hover {
    background: none !important;
}
</style>