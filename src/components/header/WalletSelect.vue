<script setup>
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import Avatar from '../common/Avatar.vue';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    btnClass: { type: String, default: ''},
    showArrow: { type: Boolean, default: false }
})

const router = useRouter()
const walletStore = useWalletStore()
const { activeWallet } = walletStore

let btnClass = ref("btn-outline-primary rounded")

onBeforeMount(() => {
   // console.log('props.btnClass===>', props.btnClass)
    if(props.btnClass.trim() != ''){
        btnClass.value = props.btnClass
    }
   // console.log('props.btnClasss2===>', btnClass.value)
})

const openWallets = () => {
    router.push(`/wallet/addresses?r=${Utils.getUriPath()}`)
}
</script>
<template>
    <div class="w-full">
        <div :class="`btn py-2 d-block addr-select-btn w-full ${btnClass}`" 
            v-if="activeWallet"
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

                <div class="center-vh">
                    <CopyBtn 
                        :text="activeWallet.address"
                        btnClasses="text-primary" 
                        :showToast="true"
                        successText="Address Copied"
                    />
                
                    <Icon v-if="showArrow"
                        @click.prevent="openWallets" 
                        name="akar-icons:chevron-right" 
                        class="ms-1 text-light" 
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.addr-select-btn {
    
    &:hover{
        background: none;
    }
    &:active, &:focus {
        border:none;
    }
}

</style>