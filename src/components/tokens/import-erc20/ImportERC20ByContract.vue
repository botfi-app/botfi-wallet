<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../../classes/Utils';
import Http from '../../../classes/Http';
import { useNetworks } from '../../../composables/useNetworks';
import { useWalletStore } from '../../../store/walletStore';
//import Image from '../../common/Image.vue';
import { useTokens } from '../../../composables/useTokens';
import { useRouter } from 'vue-router';

const contractAddr = ref("")
const networks  = useNetworks()
const tokensCore = useTokens()
const activeNetInfo = ref()
const { activeWallet } = useWalletStore()
const router = useRouter()

onBeforeMount(async () => {
    activeNetInfo.value = await networks.getActiveNetworkInfo()
})

const onSubmit = async () => {

    let loader;

    try {

        //console.log(item)
        let chainId = activeNetInfo.value.chainId 

        let contract = contractAddr.value.trim()

        let processImportStatus = await tokensCore.processImportERC20Token({ 
                                    chainId, 
                                    contract,
                                    wallet: activeWallet.address
                                })
        
        if(processImportStatus.isError()){
            return Utils.errorAlert(processImportStatus.getMessage())
        }
        
        Utils.toast("Token imported")

        router.push("/tokens")
        
    } catch(e){ 
        console.log(e, e.stack)
        Utils.errorAlert(Utils.generalErrorMsg)
    } finally {
        if(loader) loader.close()
    }
}
</script>
<template>
    <div class="mx-3 mt-4">
        <div class="form-floating mb-3 rounded">
            <input 
                type="text" 
                v-model="contractAddr"
                class="form-control rounded" 
                id="contract" 
                placeholder="0x0.."
                :autocapitalize="false"
                :autocomplete="false"
                :autocorrect="false"
            />
            <label for="contract">Contract Address</label>
        </div>
        <div>
            <button class="btn btn-primary rounded-pill w-full"
                @click.prevent="onSubmit"
            >
                Import 
            </button>
        </div>
    </div>
</template>