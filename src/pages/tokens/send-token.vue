<route>
    { 
      name: "send-token", 
      path: "/tokens/item/:contract(0x[a-fA-F0-9]{40})/send" 
    }
</route>
<script setup>
import { onBeforeMount, ref, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTokens } from '../../composables/useTokens'
import { useNetworks } from '../../composables/useNetworks';
import EthUriParser from "../../classes/EthUriParser"
import Utils from "../../classes/Utils"
import Status from "../../classes/Status"
import { useSettings } from '../../composables/useSettings'
import { parseUnits } from 'ethers';

const route = useRoute()
const initialized  = ref(false)
const tokenAddress = ref(null)
const tokenInfo    = ref(null)
const balanceInfo  = ref(null)
const tokenPrice   = ref(null) 
const { getTokenByAddr, updateBalances } = useTokens()
const { fetchSettings } = useSettings()
const { getWeb3Conn } = useNetworks()
const pageError = ref("")
const botUtils = inject("botUtils")
const qrCodeReader = ref(null)
const qrReaderSupported = ref(false)
const feeData = ref(null)


const recipient = ref("")
const amount = ref()
const amountFiat = ref(null)
const amountError = ref("")
const isLoading = ref(false)
const defaultCurrency = ref("usd")
var web3Conn = null 

onBeforeMount(async () => {
    
  initialize()

  /*setInterval(() => {
    fetchFeeData()
  }, 30_000)*/

})

watch(amount, () => {
    
    amountError.value = ''

    let amt = amount.value 
    let _token = tokenInfo.value

    if(amt == '') return;

    //lets validate 
    if(!Utils.isValidFloat(amt)){
        amountError.value = 'Invalid amount'
        return false;
    }

    let balanceInfo = _token.balanceInfo || {}

    let balanceBN = balanceInfo.balance || 0n

    let amountBN = parseUnits(amt.toString(), _token.decimals)

    if(amountBN > balanceBN){
        amountError.value = 'Insufficient balance'
        return false
    }

    if(tokenPrice.value != null){
        amountFiat.value = (tokenPrice.value * parseFloat(amt))
    }
})

const initialize = async () => {

    try {

        isLoading.value = true

        let web3ConnStatus = await getWeb3Conn()

        if(web3ConnStatus.isError()){
            return pageError.value = web3ConnStatus.getMessage()
        }

        web3Conn = web3ConnStatus.getData()

        let  userNetDataStatus = await fetchUserNetworkData()

        if(userNetDataStatus.isError()){
            return pageError.value = userNetDataStatus.getMessage()
        }

        qrCodeReader.value = botUtils.qrCodeReader()

        qrReaderSupported.value = qrCodeReader.value.isSupported()

        tokenAddress.value = route.params.contract; 

        tokenInfo.value = await getTokenByAddr(tokenAddress.value)

        //console.log("tokenInfo.value===>", tokenInfo.value)

        if(tokenInfo.value == null){
            return pageError.value = "Unknown token, kindly import it first"
        }

        let settings  = await fetchSettings()
        defaultCurrency.value = (settings.defaultCurrency || "usd").toLowerCase()

        balanceInfo.value = tokenInfo.value.balanceInfo || null

        if(balanceInfo.value == null || Object.keys(balanceInfo).length == 0){
            balanceInfo.value =  { balance: 0n, balanceDecimal: "0.0" }
        }

        if("price" in balanceInfo.value && balanceInfo.value.price != null){
            tokenPrice.value = balanceInfo.value.price
        }

        initialized.value = true

    } catch(e){

        Utils.logError("send-token#initialize:",e)
        pageError.value = Utils.generalErrorMsg

    } finally {
        isLoading.value = false
    }
}

const fetchFeeData = async () => {

    let resultStatus = await web3Conn.getFeeData()
    
    if(resultStatus.isError()) {
        return resultStatus
    }

    let resultData = resultStatus.getData()

    console.log("resultData===>", resultData)

    feeData.value = resultData

    return resultStatus
}

const fetchUserNetworkData = async () => {

   let resultsArr = await Promise.all([ fetchFeeData(), updateBalances(null, true) ])
   console.log("resultData===>>>", resultsArr)

    for(let index in resultsArr){

        // result 2 doesnt return status
        if(index == 1) continue;
        
        let resultStatus = resultsArr[index]

        // if status is error, return it
        if(resultStatus.isError()){
            return resultStatus
        }
    }

    return Status.success()
}

const showQRCodeReader = () => {
    
    if(!qrReaderSupported.value) return;

    qrCodeReader.value.show("Scan Address", (data)=> {
        
        qrCodeReader.value.close()

        try {

            if(data == ''){
                Utils.mAlert("QRCode reader returned an empty data")
            } else {

                let parsed = EthUriParser.parseURL(data)

                if(("address" in parsed) && Utils.isAddress(parsed.address)){
                    recipient.value = parsed.address
                } else {
                    Utils.mAlert("Invalid recipient address")
                }
            }

        } catch(e){
            
            console.log("send-token#showQRCodeReader:", e, e.stack)
            
            let msg = (e.message == 'Not an Ethereum URI')
                ? e.message
                : "Failed to parse QRCode data"
            
            Utils.mAlert(msg)
        }

    })
}


const setMaxAmount = () => {
    amount.value = balanceInfo.value.balanceDecimal 
}


const confirmSendToken = async () => {
    
}
</script>
<template>
    <WalletLayout
      title=""
      :showNav="false"
      :hasNetSelect="false"
      :hasAddrSelect="false"
      :pageError="pageError"
      v-if="initialized && tokenInfo != null"
    >   

        <NativeBackBtn 
            :url="`/tokens/item/${tokenAddress}`"
        />
    
        <div class="w-400 mb-5">
           
            <div class='d-flex justify-content-between px-2'>
                <div class="center-vh">
                    <Image
                        :src="tokenInfo.image"
                        :placeholder="tokenInfo.symbol"
                        :width="22"
                        :height="22"
                        class="rounded-circle shadow me-2"
                    />
                    <div class="fw-semibold fs-6 pe-2 text-truncate">
                        {{ tokenInfo.name }}
                    </div>
                </div> 
                <NetworkSelect backUrl="/tokens#tab-tokens" />
            </div>

            <div class="px-3 my-2 w-full">
                <WalletSelect />
            </div>
            
            <loading-view :isLoading="isLoading">
                <div class="px-3 my-3">
                    <div class="mb-3 mt-3">
                        <div class="form-floating">
                            <input 
                                type="text" 
                                :class="`form-control rounded ${qrReaderSupported ? '': 'no-qrcode'}`" 
                                id="recipient" 
                                placeholder="0x..." 
                                v-model="recipient"
                            />
                            <label for="recipient">
                                Send To
                            </label>
                        </div>
                        <div class="recipient-btns" v-if="qrReaderSupported">
                            <button @click.prevent="showQRCodeReader"
                                class="btn p-1 btn-sm rounded-circle text-info"
                            >
                                <Icon name="ri:qr-scan-2-line" />
                            </button>
                        </div>
                    </div>
                    <div class="mb-3 has-validation">
                        <div @click.prevent="setMaxAmount"
                            class="d-flex fs-14 mb-1 justify-content-end fw-medium m-pointer"
                        >
                            <div class='text-primary me-1'>Max:</div>
                            <div class="me-1">{{ balanceInfo.balanceDecimal }}</div>
                            <div>{{ tokenInfo.symbol }}</div>
                        </div>
                        <div :class="`form-floating ${amountError != '' ? 'is-invalid': ''}`">
                            <input 
                                type="text"
                                :class="`form-control rounded ${amountError != '' ? 'is-invalid': ''}`" 
                                id="amount" 
                                placeholder="0.1" 
                                v-model="amount"
                                v-number
                            />
                            <label for="amount">
                                Amount in {{tokenInfo.symbol.toUpperCase()}}
                            </label>
                        </div>
                        <div class="invalid-feedback" v-if="amountError != ''">
                            {{ amountError }}
                        </div>
                        <div v-else-if="amountFiat != null">
                           ~{{ amountFiat}} {{ defaultCurrency.toUpperCase() }}
                        </div>
                    </div>
                    <div class='mt-4 mb-3'>
                        <button @click.prevent="confirmSendToken"
                            class="btn btn-success rounded w-full py-2"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </loading-view>
        </div>
          
    </WalletLayout>
</template>
<style lang="scss">

input#recipient{

    padding-right: 35px;

    &.no-qrcode {
        padding-right: 10px;
    }
}

.recipient-btns {
    display: flex;
    position: relative;
    top:-45px;
    left: calc(89.5%);
    z-index: 10;
    width: 30px;
}
</style>