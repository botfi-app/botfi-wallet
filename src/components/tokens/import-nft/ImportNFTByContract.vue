<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../../classes/Utils';
import { useNetworks } from '../../../composables/useNetworks';
import { useNFT } from '../../../composables/useNFT';
import { useRouter } from 'vue-router';
import { useWalletStore } from '../../../store/walletStore';

const contractAddr = ref("")
const tokenId = ref("")
const tokenStandard = ref("")
const networks  = useNetworks()
const activeNetInfo = ref()
const router = useRouter()
const { getNFTStandard, processImportNFT } = useNFT()
const  {  getActiveWalletInfo } = useWalletStore()


onBeforeMount(async () => {
    activeNetInfo.value = await networks.getActiveNetworkInfo()
})

const onSubmit = async () => {
    let loader;

    try {

        let _contractAddr = contractAddr.value.trim()
        let _tokenId = tokenId.value.toString().trim()
        let _tokenStandard = tokenStandard.value.trim()

  
        loader = Utils.loader(`Detecting NFT Standard`)

        //lets retrieve the token Standard 
        if(_tokenStandard == ""){
            let tokenStandardStatus = await getNFTStandard(_contractAddr)

            if(tokenStandardStatus.isError()){
                return Utils.mAlert(tokenStandardStatus.getMessage())
            }

            _tokenStandard = tokenStandardStatus.getData()
        }//end auto retrieve token Standard


        let wallet = (await getActiveWalletInfo()).address

        
        let resultStatus = await processImportNFT({ 
                                wallet, 
                                contract: _contractAddr,
                                tokenId: _tokenId,
                                standard: _tokenStandard
                            })

        if(resultStatus.isError()){
            return Utils.errorAlert(resultStatus.getMessage())
        }

        Utils.mAlert(`NFT imported`)
        
        contractAddr.value = ''
        tokenId.value = ''

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
        <div class="form-floating mb-3 rounded">
            <input 
                type="text" 
                v-model="tokenId"
                class="form-control rounded" 
                id="tokenId" 
                placeholder="eg. 1"
                :autocapitalize="false"
                :autocomplete="false"
                :autocorrect="false"
            />
            <label for="tokenId">Token ID</label>
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