<script setup>
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import Avatar from '../common/Avatar.vue';
import { onBeforeMount, ref, watch } from 'vue';
import { Modal as bsModal } from 'bootstrap';

const p = defineProps({
            btnClass: { type: String, default: '' }
          })

const emits = defineEmits(["change"])

const walletStore = useWalletStore()
const id = ref("account-select-modal")
const dataToRender = ref(null)
const isLoading = ref(false)


onBeforeMount(async() => {
   // acctsArr.value = await walletStore.getWalletAddresses()
})


const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}

const updateWallet = async (item, key) => {

    let loader = Utils.loader("Setting Active Wallet")
    let resultStatus = await walletStore.setActiveWallet(item.address)
    
    loader.close()

    if(resultStatus.isError()){
       return Utils.mAlert(resultStatus.getMessage())
    }

    emits("change", item.address)

    bsModal.getInstance(`#${id}`).hide()
}
</script>
<template>
    <div v-if="walletStore.activeWallet">
        <button 
            :class="`btn text-truncate fs-14 acct-select-btn ms-1 px-2 center-vh rounded-pill`"
        >
            <Avatar 
                :name="walletStore.activeWallet.address" 
                :square="false" 
                :size="28" 
                variant="ring"
                class="rounded"
                :key="walletStore.activeWallet.address"
            />
            <div class="ms-1">
                {{ Utils.maskAddress(walletStore.activeWallet.address, 2, 4) }}
            </div>
        </button>
    </div>
</template>
<style lang="scss">
 .acct-select-btn {
    background: var(--bs-body-bg) !important;
    opacity: 0.8;
    font-size: 14px;
 }
</style>