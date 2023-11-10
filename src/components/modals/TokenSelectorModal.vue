<script setup>
import { onBeforeMount, ref } from 'vue';
import { useTokens } from '../../composables/useTokens';
import { useNetworks } from '../../composables/useNetworks';
import Utils from '../../classes/Utils';
import Http from '../../classes/Http';

const props = defineProps({
                includeUserTokens: { type: Boolean, default: true },
                includeAllVerified: { type: Boolean, default: true },        
            })

const networks  = useNetworks()
const tokensCore = useTokens()
const tokensDataArr = ref([])
const activeNetInfo = ref({})
const keyword = ref("")
const errorMsg = ref("")
const id = ref("token-selector-modal")
const isLoading = ref(false) 

onBeforeMount(() => {
    fetchData()
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
        let dataObj = {}

        for(let item of resultDataArr){
            let contractAddr =  (item.contracts.filter((c) => (
                                    c.chainId == netInfo.chainId))[0]
                                ).contract.toLowerCase();

            item.contract = contractAddr
            dataObj[contractAddr] = item;
            //console.log("contract===>", contract)
        }

        if(props.includeUserTokens){
            let usersTokens = await tokensCore.getTokens()

            for(let addr of Object.keys(usersTokens)){
                let addrLower = addr.toLowerCase()
                if(!(addrLower in dataObj)){
                    dataObj[addrLower]= usersTokens[addr]
                }
            }
        }

        //console.log("dataObj==>", dataObj)
    } catch(e){
        errorMsg.value = Utils.generalErrorMsg
        Utils.logError("TokenSelectorModal#initialize:", e)
    } finally {
        isLoading.value = false
    }
}

const onSearch = async (_keyword) => {
    _keyword = _keyword.trim()
    keyword.value = _keyword

    if(_keyword.trim() == ""){
        //tokensDataArr.value = initialData.value
    } else {
        //fetchData()
    }
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
            <div>
                <div class="import-search-form px-2">
                    <SearchForm
                        :dataToFilter="null"
                        :filterKeys="[]"
                        @change="onSearch"
                    />
                </div>
            </div>
        </template>
    </Modal>
</template>