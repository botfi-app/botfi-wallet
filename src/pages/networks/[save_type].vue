<route>
    { path: "/networks/:save_type(add|edit)" }
</route>
<script setup>
import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import WalletLayout from '../../layouts/WalletLayout.vue';
import NativeBackBtn from '../../components/common/NativeBackBtn.vue';
import MainBtn from "../../components/common/MainBtn.vue"
import { useRoute } from 'vue-router';

const initialized   = ref(false)
const activeNetInfo = ref({})
const allNetworks   = ref({})
const walletStore   = useWalletStore()
const route         = useRoute()
const isLoading     = ref(false)
const pageTitle     = ref("")
const formData      = ref({})


onBeforeMount(() => {
    initialize()
})

const initialize = async () => {

    let saveType = route.params.save_type

    let userNetworks = await walletStore.getUserNetworks()    
    activeNetInfo.value = userNetworks.networks[userNetworks.default]
    allNetworks.value = userNetworks.networks


}
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