<script setup>
import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import WalletLayout from '../../layouts/WalletLayout.vue';
import NativeBackBtn from '../../components/common/NativeBackBtn.vue';
import MainBtn from "../../components/common/MainBtn.vue"

const initialized = ref(false)
const activeNetInfo = ref({})
const allNetworks = ref({})
const walletStore = useWalletStore()
const isLoading   = ref(false)
const pageTitle = ref("")

onBeforeMount(() => {
    
})
</script>
<template>
     <WalletLayout
        title="Networks"
        :show-nav="false"
        v-if="initialized"
    >   

        <NativeBackBtn />

        <div class="w-400">
            <Navbar 
                :title="pageTitle"
            />

            <div class="form-group">
                <div class="form-floating mb-3">
                    <input 
                        type="text" 
                        class="form-control" 
                        id="network-name" 
                        placeholder=""
                    />
                    <label for="network-name">Network Name</label>
                </div>
            </div>
        </div>
    </WalletLayout>
</template>