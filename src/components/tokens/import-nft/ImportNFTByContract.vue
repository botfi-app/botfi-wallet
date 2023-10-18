<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../../classes/Utils';
import { useNetworks } from '../../../composables/useNetworks';
import { useNFT } from '../../../composables/useNFT';
import { useRouter } from 'vue-router';

const contractAddr = ref("")
const tokenId = ref("")
const tokenStandard = ref("")
const networks  = useNetworks()
const activeNetInfo = ref()
const router = useRouter()
const { getNFTStandard, fetchNFTOnChain } = useNFT()

onBeforeMount(async () => {
    activeNetInfo.value = await networks.getActiveNetworkInfo()
})

const onSubmit = async () => {
    let loader;

    try {

        let _contractAddr = contractAddr.value.trim()
        let _tokenId = tokenId.value.toString().trim()
        let _tokenStandard = tokenStandard.value.trim()

        if(!Utils.isAddress(_contractAddr)){
            return Utils.errorAlert("Invalid contract address")
        }

        if(!/\d+/.test(_tokenId)){
            return Utils.errorAlert("A valid token ID is required")
        }

        loader = Utils.loader(`Processing Request`)

        //lets retrieve the token Standard 
        if(_tokenStandard == ""){
            let tokenStandardStatus = await getNFTStandard(_contractAddr)

            if(tokenStandardStatus.isError()){
                return Utils.mAlert(tokenStandardStatus.getMessage())
            }

            _tokenStandard = tokenStandardStatus.getData()
        }//end auto retrieve token Standard

       
        let resultStatus = await fetchNFTOnChain(_contractAddr, _tokenId, _tokenStandard)

        console.log("resultStatus====>", resultStatus)
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
        <!--
        <div class="form-floating">
            <select class="form-select" id="floatingSelect" aria-label="Floating label select example">
                <option selected>Select one</option>
                <option value="erc721">ERC-721</option>
                <option value="erc1155">ERC-1155</option>
            </select>
            <label for="floatingSelect">Token Standard</label>
        </div>
        -->
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
            <label for="tokenId">Token Id</label>
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