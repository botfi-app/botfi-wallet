<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../../classes/Utils';
import Http from '../../../classes/Http';
import { useNetworks } from '../../../composables/useNetworks';
import { useWalletStore } from '../../../store/walletStore';
//import Image from '../../common/Image.vue';
import { useTokens } from '../../../composables/useTokens';
import { useRouter } from 'vue-router';
import GeckoApi from '../../../classes/GeckoApi';

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
        
        if(!Utils.isAddress(contract)){
            return Utils.errorAlert("A valid contract address is required")
        }

        loader = Utils.loader("Verifying contract onchain")

        let verifyStatus = await tokensCore.getERC20TokenInfo({ 
                                contract, 
                                wallet: activeWallet.address 
                            })

        if(verifyStatus.isError()){
            return Utils.errorAlert(verifyStatus.getMessage())
        }

        let tokenInfo = verifyStatus.getData()

        //console.log("tokenInfo==>", tokenInfo)
        //tokenInfo.isCustomImport = true 
        
        let action =   await Utils.getSwal().fire({
                            showCancelButton: true,
                            confirmButtonText: 'Import',
                            denyButtonText:     'Cancel',
                            html: Utils.getImportConfirmHtmlMsg(tokenInfo),
                            title: "Confirm Action",
                        })

        if(!action.isConfirmed) return;

        loader = Utils.loader("Processing...")

        let dbTokenInfoStatus = await Http.getApi("/contracts/token-info", { chainId, contract })

        //console.log("dbTokenInfoStatus===>", dbTokenInfoStatus)

        if(!dbTokenInfoStatus.isError()){
            let dbTokenInfo = dbTokenInfoStatus.getData()

            if(dbTokenInfo != null){
                tokenInfo.geckoId = dbTokenInfo.geckoId || "";

               // let uriEnd
                //lets get gecko coin info
                let geckoCoinInfoStatus = await GeckoApi.getCoinInfo(tokenInfo.geckoId)

                if(!geckoCoinInfoStatus.isError()){
                    let geckoCoinInfo = geckoCoinInfoStatus.getData()

                    //console.log("geckoCoinInfo===>", geckoCoinInfo)
                    let images = geckoCoinInfo.image || {}

                    if("large" in images) {
                        tokenInfo.image = images.large
                    }
                }


            }
            
        }
        
        //tokenInfo.image = item.image
        tokenInfo.contract = contract
        tokenInfo.chainId = chainId
        delete tokenInfo.balanceOf;
        delete tokenInfo.balanceOfDecimal;

        // lets now import the token 
        let importStatus = await tokensCore.importToken(tokenInfo)

        if(importStatus.isError()){
            return Utils.errorAlert(verifyStatus.getMessage())
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