<route>
    { 
      name: "scan-result", 
      path: "/scanner/result/:chainId/:chainName/:contract(0x[a-fA-F0-9]{40})" 
    }
</route>
<script setup>
import { onBeforeMount, ref, inject } from 'vue';
import { useRoute } from 'vue-router';
import Utils from '../../classes/Utils';
import Http from '../../classes/Http';

const errorMsg = ref("")
//const title = ref("Scan")
const isLoading = ref(false)
const chainId = ref()
const chainName = ref("")
const contract = ref("")
const route = useRoute()
const scanResult = ref({})
const projectName = ref("")
const projectIssues = ref([])

const basicInfo = ref([])
const botUtils = inject("botUtils")


onBeforeMount(() => {
    initialize()
})

const initialize = () => {

    let p = route.params;
    contract.value = p.contract;
    chainId.value = p.chainId;
    chainName.value = p.chainName;

    processScan()
}

const processScan = async () => {
    try {

        errorMsg.value = ""
        isLoading.value = true 
        let url = `/scan/token/${chainId.value}/${contract.value}`
        
        let resultStatus = await Http.getApi(url)

        console.log("resultStatus===>", resultStatus)

        if(resultStatus.isError()){
            errorMsg.value = resultStatus.getMessage()
            return false;
        }

        let resultData = resultStatus.getData() || []

        scanResult.value = resultData

        let projectInfo = resultData.projectInfo

        let _projectIssues = (projectInfo.coreIssues || [])
        
        _projectIssues.sort((a, b) => (a.issues.length > b.issues.length) ? -1 : 0 )

        projectName.value = projectInfo.name;
        projectIssues.value = _projectIssues

        let hi = resultData.holdersInfo
        let li =  resultData.liquidityInfo

        let noStr = (v) => Number(v || "").toLocaleString('fullwide', {useGrouping:true})

        //let contractName = projectInfo.contractName;

        let _basicInfo = {
            name: projectInfo.name, 
            total_supply: `${noStr(hi.tokenTotalSupply)}`,
            creator: hi.creator,
            creator_balance: `${noStr(hi.creatorBalance)}`
        }

        if(hi.owner && hi.owner.length > 0){
            _basicInfo["owner"] = hi.owner
            _basicInfo["owner_balance"] = `${noStr(hi.ownerBalance)}`
        }

        _basicInfo["has_adequate_liquidity"] = li.isAdequateLiquidityPresent ? 'Yes' : 'No'
        
        _basicInfo["total_liquidity"] = `${noStr(li.totalLiquidity)}`
        _basicInfo["total_liquidity_burned"] = `${li.totalBurnedPercent}%`
        _basicInfo["total_liquidity_locked"] = `${li.totalLockedPercent}%`

        basicInfo.value = _basicInfo

        saveToHistory()
    }catch(e){
        Utils.logError("scanner#initialize:",e)
        errorMsg.value = Utils.generalErrorMsg
    } finally {
        isLoading.value = false
    }
}

const onSubmit = async (_chainId, chainName, _contract) => {
    chainId.value = _chainId
    chainName.value = chainName
    contract.value = _contract
    processScan()
}

const saveToHistory = async () => {

    let storeKey = `${botUtils.getUid()}_scan_history`

    let histoyDataStr = localStorage.getItem(storeKey) || "[]"
    let historyArr = []

    try{ historyArr = JSON.parse(histoyDataStr) } catch(e){}

    let _contract = contract.value.toLowerCase()

    for(let item of historyArr){
        if(item.contract.toLowerCase() ==  _contract && item.chainId == chainId.value){
            return;
        }
    }

    let dataLimit = 20

    if(historyArr.length >= dataLimit){
        historyArr.pop()
    }

    historyArr.unshift({ 
        name: scanResult.value.projectInfo.name, 
        chainName:  chainName.value,
        chainId:    chainId.value,
        contract:   _contract
    })

    // save history
    localStorage.setItem(
        storeKey, 
        JSON.stringify(historyArr)
    )
}
</script>
<template>
    <WalletLayout
        title=""
        :has-footer="false"
        :has-header="false"
    >

        <NativeBackBtn url="/scanner" />

        <div class="w-400 mb-5">
            <div class="d-flex p-2 align-items-center justify-content-between flex-nowrap">
                <div class="fw-semibold fs-6 pe-2 text-truncate">
                    Scan Result
                </div>
                <div class="ps-2">
                    <button class="btn btn-primary rounded-pill v-center"
                        data-bs-toggle="modal" 
                        data-bs-target="#new-scan-modal"
                    >
                        <Icon name="ri:scan-2-fill" :size="18" />
                        <div class="px-1">New</div>
                    </button>
                </div>
            </div>
            <div class="">
                <div v-if="errorMsg != ''">
                    <InlineError :text="errorMsg" @retry="processScan" />
                </div> 
                <div v-else>
                    <loading-view :isLoading="isLoading">
                        <div class="mt-2">
                         
                            <div class="accordion px-0 mx-0" id="scan-analysis">
                                <div class="accordion-item px-0 mx-0">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed px-2" 
                                            type="button" 
                                            data-bs-toggle="collapse" 
                                            data-bs-target="#basic-info" 
                                            aria-expanded="false" 
                                            aria-controls="basic-info"
                                        >
                                            <div class="fw-bold text-upper ls-2 hint fs-11">
                                                Basic Info
                                            </div>
                                        </button>
                                    </h2>
                                    <div id="basic-info" 
                                        class="accordion-collapse collapse show px-0 mx-0" 
                                        data-bs-parent="#scan-analysis"
                                    >
                                        <div class="accordion-body px-0">
                                            <ul class="list-group list-group-flush px-0 mx-0">
                                                <template v-for="(value, key) in basicInfo">
                                                    <li class="list-group-item py-3 mx-0 d-flex align-items-center">
                                                        <div>
                                                            <div class="fw-bold mb-1 text-upper ls-2 hint fs-11 text-capitalize">
                                                                {{ key.replace(/(_)+/g, " ") }}
                                                            </div>
                                                            <div class="fs-14 fw-medium text-break">
                                                                {{ value }}
                                                            </div>
                                                        </div>
                                                    </li>
                                                </template>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <ScanIssuesRender 
                                    id="project-analysis-issues"
                                    title="project Analysis"
                                    :data="projectIssues"
                                />

                                <ScanIssuesRender 
                                    id="holders-analysis-issues"
                                    title="Holders Analysis"
                                    :data="scanResult.holdersInfo.issues"
                                />


                                <ScanIssuesRender 
                                    id="liquidity-analysis-issues"
                                    title="Liquidity Analysis"
                                    :data="scanResult.liquidityInfo.issues"
                                />

                                <div class="accordion-item px-0 mx-0">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button px-2" 
                                            type="button" 
                                            data-bs-toggle="collapse" 
                                            data-bs-target="#top-10-holders" 
                                            aria-expanded="false" 
                                            aria-controls="top-10-holders"
                                        >
                                            <div class="fw-bold text-upper ls-2 hint fs-11">
                                                Top 10 Holders
                                            </div>
                                        </button>
                                    </h2>
                                    <div id="top-10-holders" 
                                        class="accordion-collapse collapse px-0 mx-0" 
                                        data-bs-parent="#scan-analysis"
                                    >
                                        <div class="accordion-body px-0">
                                            <ul class="list-group list-group-flush px-0 mx-0">
                                                <template v-for="(value, key) in scanResult.holdersInfo.topHolders">
                                                    <li class="list-group-item py-3 mx-0 d-flex align-items-center">
                                                        Lol
                                                    </li>
                                                </template>
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </loading-view>
                </div>
            </div>
        </div>
    </WalletLayout>
    <NewScanModal 
        @submit="onSubmit"
    />
</template> 
<style lang="scss" scoped>
.accordion-button[aria-expanded=true] {
    background: rgba(0,0,0, 0.2) !important;
}
</style>