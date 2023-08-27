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
const saveType      = ref("")
const networkId     = ref(null)
const pageError     = ref("")
const isEdit        = ref(false)

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {
    try{
        pageError.value = ""
        saveType.value = route.params.save_type

        let userNetworks = await walletStore.getUserNetworks()    
        activeNetInfo.value = userNetworks.networks[userNetworks.default]
        allNetworks.value = userNetworks.networks

        if( saveType.value == 'edit') {
            
            let netId = route.query.chainId || ""

            if(netId == "" || !(netId in allNetworks.value)){
                pageError.value = `A valid network id is required`
                return false;
            }

            isEdit.value = true
        }

        

        initialized.value = true

    } catch(e){
        Utils.logError(e)
    } finally {
        initialized.value = true
    }
}
</script>
<template>
     <WalletLayout
        title="Networks"
        :show-nav="false"
        v-if="initialized"
        :page-error="pageError"
    >   

        <NativeBackBtn />

        <div class="w-400">
            <Navbar 
                :title="pageTitle"
            />

            <div class="form-group px-3">
                <div class="form-floating mb-3">
                    <input 
                        type="text" 
                        class="form-control rounded" 
                        id="network-name" 
                        placeholder="eg. Ethereum Mainnet"
                    />
                    <label for="network-name">Network Name</label>
                </div>
            </div>
        </div>
    </WalletLayout>
</template>