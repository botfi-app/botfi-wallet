<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import { useTokens } from '../../composables/useTokens';
import { useNetworks } from '../../composables/useNetworks';
import Utils from '../../classes/Utils';
import Http from '../../classes/Http';
import { Modal as bsModal } from 'bootstrap';
import { useWalletStore } from '../../store/walletStore';


const props = defineProps({
                includeUserTokens: { type: Boolean, default: true },
                includeAllVerified: { type: Boolean, default: true }, 
                tokenSpender: { type: String, default: ""},  
                selected: { type: String, }      
            })

const emit = defineEmits(['select', "init"])


const selected = ref(props.selected)
const initialized = ref(false)
const networks   = useNetworks()
const tokensCore = useTokens()
const searchResults = ref([])
const keyword = ref("")
const errorMsg = ref("")
const id = ref("token-selector-modal")
const isLoading = ref(false) 
const initialData = ref({})
const walletStore = useWalletStore()
const walletAddrs = ref([])
const activeWallet = ref()
const showImportBtn = ref(false)
const netInfo = ref({})

let intval;

onBeforeMount(async () => {

    netInfo.value = await networks.getActiveNetworkInfo()

    activeWallet.value = await walletStore.getActiveWalletInfo()
    walletAddrs.value = await walletStore.getWalletAddresses()

    let chainId = netInfo.value.chainId


    if(window.swapTokens && chainId in window.swapTokens){
        searchResults.value = window.swapTokens[chainId] || {}
    } else {
        await fetchData()
    }

    initialData.value = searchResults.value

    initialized.value = true

    emit("init", { reloadBalances, getTokenInfo })
})

onBeforeUnmount(() => {
    if(intval) clearInterval(intval)
})

const getTokenInfo = (tokenAddr) => {
   
    let tokenInfo = null;
    let allTokensArr = [...searchResults.value,  ...initialData.value]
    
    allTokensArr.forEach(t => {
        if(t.contract.toLowerCase() == tokenAddr.toLowerCase()){
            tokenInfo = t
            return;
        }
    }) 

    return tokenInfo
}

const reloadBalances = async () => {
    initialData.value = await fetchTokensOnChainDataAndBalances(initialData.value)
}

const fetchData = async () => {
    try {

        let chainId = netInfo.value.chainId

        let params = { keyword: keyword.value, chainId }

        //activeNetInfo.value = netInfo

        isLoading.value = true 

        let resultStatus = await Http.getApi("/tokens/verified", params)

        //console.log("resultStatus===>", resultStatus)

        if(resultStatus.isError()){
            //errorMsg.value = resultStatus.getMessage()
            Utils.logError(`modals#TokenSelectorModal#fetchData: ${resultStatus.getMessage()}`)
            return false;
        }

        let resultDataArr = resultStatus.getData() || []
        let tokensContracts = {}

        let tokensDataArr = resultDataArr.map(item => {
            let contractAddr =  (item.contracts.filter((c) => (
                                    c.chainId == chainId))[0]
                                ).contract.toLowerCase();
            item.contract = contractAddr

            tokensContracts[contractAddr] = true 

            return item 
        })

        //console.log("tokensContracts====>", tokensContracts)

        // include users tokens
        if(props.includeUserTokens){
            let usersTokens = await tokensCore.getTokens()

            //console.log("usersTokens===>", usersTokens)

            for(let addr of Object.keys(usersTokens)){
                
                let addrLower = addr.toLowerCase()

                if(!(addrLower in tokensContracts)){
                    tokensDataArr.unshift(usersTokens[addr])
                    tokensContracts[addrLower] = true 
                }
            }
        }

        //console.log("tokensDataArr====>", tokensDataArr)

        // remove the native token as we are only fethcing erc20 info
        ///delete tokensContracts[Utils.nativeTokenAddr.toLowerCase()]
        
        let tokensOnChainData = await fetchTokensOnChainDataAndBalances(tokensDataArr)
        
        //console.log("tokensOnChainData===>", tokensOnChainData)
        if(!Array.isArray(tokensOnChainData)) return false;

        searchResults.value = tokensOnChainData

    } catch(e){
        errorMsg.value = Utils.generalErrorMsg
        Utils.logError("TokenSelectorModal#initialize:", e)
    } finally {
        isLoading.value = false
    }
}

const fetchTokensOnChainDataAndBalances = async (tokensDataArr) => {


    let tokensContractsArr = []
    
    tokensDataArr.forEach(item => {
        if(!Utils.isNativeToken(item.contract)) tokensContractsArr.push(item.contract)
    })

    let onchainERC20TokenData = {}
    let onChainNativeTokenBalances = {}
        
    if(tokensContractsArr.length > 0){
        let onChainERC20Balance =  tokensCore.getBulkERC20TokenInfo(
                                        tokensContractsArr,
                                        walletAddrs.value,
                                        props.tokenSpender
                                    )

        let nativeTokensPromise = tokensCore.getNativeTokensBalancesBulk(walletAddrs.value, true)

        let promiseResultArr = await Promise.all([onChainERC20Balance, nativeTokensPromise])

        for(let resultStatus of promiseResultArr){
            if(resultStatus.isError()){
                errorMsg.value =  "Failed to onchain fetch token data"
                return false
            }
        }

        onchainERC20TokenData = promiseResultArr[0].getData() || {}
        onChainNativeTokenBalances = promiseResultArr[1].getData() || {}
    } //end if 

    ///console.log("onchainERC20TokenData===>", onchainERC20TokenData)
    //console.log("onchainTokenData====> ", onchainTokenData)
    //console.log("onChainNativeTokenBalances===>", onChainNativeTokenBalances)

    let activeWalletAddr = activeWallet.value.address.toLowerCase()

    let processedTokenData = []

    for(let item of tokensDataArr){

        let contractAddr = item.contract.toLowerCase()

        //console.log("contractAddr===>", contractAddr)

        if(Utils.isNativeToken(contractAddr)){

            //let userBalances = await tokensCore.getUserBalances()
            item.balances =  onChainNativeTokenBalances 

        } else {
            
            //console.log("contractAddr==>", contractAddr)

            let onChainItem = onchainERC20TokenData[contractAddr] || null 

            //console.log("onChainItem===>", onChainItem)
            
            if(onChainItem == null) continue;

            item.balances = onChainItem.balances; 
           
            item.allowances = onChainItem.allowances; 
            item.decimals = Number(onChainItem.decimals)
        }

        item.balanceInfo = item.balances[activeWalletAddr]

        //console.log("item.balanceInfo===>", item.balanceInfo)

        processedTokenData.push(item)
        
    }
    
    
    let processedTokenDataSorted = processedTokenData.sort(( item1, item2 ) => {
        let balance1 = item1.balances[activeWalletAddr].value || BigInt(0)
        let balance2 = item2.balances[activeWalletAddr].value ||  BigInt(0)

        if(balance1 > balance2) return -1;
        else if(balance1 < balance2) return 1
        else return 0
    })    

    let chainId = netInfo.value.chainId

    if(window.swapTokens){
        window.swapTokens[chainId] = processedTokenDataSorted
    } else {
        window.swapTokens = { [chainId]: processedTokenDataSorted }
    }

    return processedTokenDataSorted
}

const getBalance = (tokenInfo) => {
    let balance = tokenInfo.balanceInfo.formatted;
    if(balance == 0) return ""
    return `${Utils.formatCrypto(balance, 4)}`
}

const onSearch = async (_keyword) => {

    showImportBtn.value = false
    
    _keyword = _keyword.trim()
    keyword.value = _keyword

    if(Utils.isAddress(_keyword)){

        let contractData = null;

        initialData.value.forEach(item => {
            if(item.contract.toLowerCase() == _keyword.toLowerCase()){
                contractData = item
            }
        })

        //console.log("contractData===>", contractData)

        if(contractData != null){
            searchResults.value = [contractData]
        } else {
            showImportBtn.value = true
        }
        
        return false;
    }

    if(_keyword.trim() == ""){
        searchResults.value = initialData.value
    } else {
        fetchData()
    }
}

const onItemSelect = async (item) => {
    selected.value = item.contract;
    emit('select', item)
    bsModal.getInstance("#token-selector-modal").hide()
}

const importToken = async () => {

    let loader;

    try {

        loader = Utils.loader("Fetching token info")

        let contract = keyword.value

        let tokenInfoStatus = await tokensCore.getBulkERC20TokenInfo(
                            [contract],
                            walletAddrs.value,
                            props.tokenSpender
                        )

        loader.close()

        //console.log("tokenInfoStatus===>", tokenInfoStatus)

        if(tokenInfoStatus.isError()){
            return Utils.mAlert(tokenInfoStatus.getMessage())
        }

        let tokenInfoObj = tokenInfoStatus.getData() || {}

        let tokenInfo = tokenInfoObj[contract.toLowerCase()]
        tokenInfo.contract = contract

        let chainId = netInfo.value.chainId


        let tokenInfoToImport = {
            name:       tokenInfo.name, 
            symbol:     tokenInfo.symbol,
            decimals:   tokenInfo.decimals,
            chainId,
            contract
        }

        //console.log("tokenInfoToImport==>", tokenInfoToImport)

        let importTokenStatus = await tokensCore.importToken(tokenInfoToImport)

        if(importTokenStatus.isError()){
            return Utils.mAlert(importTokenStatus.getMessage())
        }

        initialData.value.push(tokenInfo)
        searchResults.value = [tokenInfo]

    } catch(e) {
        Utils.logError("TokenSelectorModal#importToken", e)
        Utils.mAlert("Token import failed")
    }
}
</script>
<template>

    <Modal
        :id="id"
        title="Select Token"
        :has-header="true"
        :has-footer="false"
        size="modal-md"
    >
        <template #body>
            
            <ScrollToTop
               :scrollElement="`#${id}`"
            />

            <div>
                <div class="import-search-form px-2">
                    <SearchForm
                        :dataToFilter="null"
                        :filterKeys="[]"
                        @change="onSearch"
                        placeholder="Search name or paste address"
                        :disabled="isLoading"
                    />
                </div>
                <div v-if="showImportBtn" class="pb-2 center-vh">
                    <div class="py-5">
                        <div class="center-vh">
                            <h5 class="hint">Token not found</h5>
                        </div>
                        <div class="center-vh">
                            <button @click="importToken" class='btn btn-primary rounded'>
                                Import
                            </button>
                        </div>
                    </div>
                </div>
                <div v-else class="pb-2">
                    <loading-view :isLoading="isLoading">
                        <ul class="list-group list-group-flush w-full">
                            <template v-for="(item, contract) in searchResults" :key="contract">
                                <li class="list-group-item py-3 m-pointer no-select"
                                    @click.prevent="onItemSelect(item)"
                                >
                                    <div class="d-flex justify-content-between">
                                        <div class="d-flex">
                                            <Image 
                                                :src="item.image" 
                                                :placeholder="item.symbol[0].toUpperCase()"
                                                :width="24"
                                                :height="24"
                                                class="rounded-circle shadow-lg me-2"
                                            />
                                            <div>
                                                <span>{{ item.name }}</span>
                                                <span class="ms-2 muted hint">
                                                    {{ item.symbol.toUpperCase() }}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div class="d-flex justify-content-end">
                                            <div class="fs-14">
                                                {{ getBalance(item) }}
                                            </div>
                                            <Icon 
                                                v-if="item.contract == selected"
                                                name="teenyicons:tick-solid" 
                                                class="text-success ms-2" 
                                                :size="14"
                                            />
                                        </div>
                                     
                                    </div>
                                </li>
                            </template>
                        </ul>
                    </loading-view>
                </div>
            </div>
        </template>
    </Modal>
</template>