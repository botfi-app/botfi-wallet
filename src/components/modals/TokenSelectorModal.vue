<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { useTokens } from '../../composables/useTokens';
import { useNetworks } from '../../composables/useNetworks';
import Utils from '../../classes/Utils';
import Http from '../../classes/Http';
import { Modal as bsModal } from 'bootstrap';
import { useWalletStore } from '../../store/walletStore';


const props = defineProps({
                includeUserTokens: { type: Boolean, default: true },
                includeAllVerified: { type: Boolean, default: true },  
                selected: { type: String, }      
            })

const emit = defineEmits(['select'])


const selected = ref(props.selected)
const initialized = ref(false)
const networks   = useNetworks()
const tokensCore = useTokens()
const searchResults = ref({})
const netInfo = ref({})
const keyword = ref("")
const errorMsg = ref("")
const id = ref("token-selector-modal")
const isLoading = ref(false) 
const initialData = ref({})
const walletStore = useWalletStore()
const walletAddrs = ref([])
const activeWallet = ref()


onBeforeMount(async () => {

    activeWallet.value = await walletStore.getActiveWalletInfo()
    walletAddrs.value = await walletStore.getWalletAddresses()

    await fetchData()
    initialData.value = searchResults.value
    initialized.value = true 
})


const fetchData = async () => {
    try {

        let netInfo = await networks.getActiveNetworkInfo()

        let params = { keyword: keyword.value, chainId: netInfo.chainId }

        //activeNetInfo.value = netInfo

        isLoading.value = true 

        let resultStatus = await Http.getApi("/tokens/verified", params)

        if(resultStatus.isError()){
            errorMsg.value = resultStatus.getMessage()
            return false;
        }

        let resultDataArr = resultStatus.getData() || []
        let tokensContracts = {}

        let tokensDataArr = resultDataArr.map(item => {
            let contractAddr =  (item.contracts.filter((c) => (
                                    c.chainId == netInfo.chainId))[0]
                                ).contract.toLowerCase();
            item.contract = contractAddr

            tokensContracts[contractAddr] = true 

            return item 
        })

        // include users tokens
        if(props.includeUserTokens){
            let usersTokens = await tokensCore.getTokens()

            for(let addr of Object.keys(usersTokens)){
                
                let addrLower = addr.toLowerCase()
                
                if(!Utils.isNativeToken(addr)){
                    tokensContracts[addrLower] = true 
                }

                if(!(addrLower in tokensContracts)){
                    tokensDataArr.unshift(usersTokens[addr])
                }
            }
        }

        let tokensOnChainData = await fetchTokensOnChainDataAndBalances(
                                    tokensContracts,
                                    tokensDataArr
                                )
        
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

const fetchTokensOnChainDataAndBalances = async (tokensContracts, tokensDataArr) => {

    let tokensContractsArr = Object.keys(tokensContracts)
        
    let onChainTokenDataStatus = await tokensCore.getBulkERC20TokenInfo(
                                    tokensContractsArr,
                                    walletAddrs.value
                                )

    if(onChainTokenDataStatus.isError()){
        errorMsg.value =  "Failed to onchain fetch token data"
        return false
    }

    let onchainTokenData = onChainTokenDataStatus.getData() || {}

    let processedTokenData = []

    for(let item of tokensDataArr){

        let contractAddr = item.contract.toLowerCase()


        if(Utils.isNativeToken(contractAddr)){

            let userBalances = await tokensCore.getUserBalances()
            item.balances  = userBalances[contractAddr]

        } else {
            
            let onChainItem = onchainTokenData[contractAddr] || null 
            
            if(onChainItem == null) continue;

            item.balances = onChainItem.balances; 
            item.decimals = Number(onChainItem.decimals)
        }

        processedTokenData.push(item)
    }
    
    let acctAddr = activeWallet.value.address.toLowerCase()

    let processedTokenDataSorted = processedTokenData.sort(( item1, item2 ) => {
        let balance1 = item1.balances[acctAddr].value || 0n
        let balance2 = item2.balances[acctAddr].value || 0n

        if(balance1 > balance2) return -1;
        else if(balance1 < balance2) return 1
        else return 0
    })    

    return processedTokenDataSorted
}

const getBalance = (tokenItem) => {
    
    let balances = tokenItem.balances || null 

    if(balances == null) return ""
    
    let wallet = activeWallet.value.address.toLowerCase()
    let balance = balances[wallet].formatted;

    if(balance == 0) return ""

    return `${balance} ${tokenItem.symbol.toUpperCase()}`
}

const onSearch = async (_keyword) => {

    _keyword = _keyword.trim()
    keyword.value = _keyword

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
</script>
<template>

    <Modal
        :id="id"
        title="Select Token"
        :has-header="true"
        :has-footer="false"
        size="modal-sm"
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
                    />
                </div>
                <div class="pb-2">
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
                                            <div>{{ item.name }}</div>
                                            <div class="ms-2 muted hint">
                                                {{ item.symbol.toUpperCase() }}
                                            </div>
                                        </div>
                                        
                                        <div class="d-flex">
                                            <div class="fs-12 fw-semibold">
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