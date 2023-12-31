<route>
    { 
      name: "scan-result", 
      path: "/scanner/result/:chainId/:contract(0x[a-fA-F0-9]{40})" 
    }
</route>
<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import Utils from '../../classes/Utils';
import Http from '../../classes/Http';

const errorMsg = ref("")
const title = ref("Scan")
const isLoading = ref(false)
const chainId = ref()
const contract = ref("")
const route = useRoute()
const scanResult = ref({})
const projectName = ref("")
const projectIssues = ref([])

const basicInfo = ref([])

onBeforeMount(() => {
    initialize()
})

const initialize = () => {

    let p = route.params;
    contract.value = p.contract;
    chainId.value = p.chainId;

    processScan()
}

const processScan = async () => {
    try {

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

        let noStr = (v) => Number(v || "").toLocaleString('fullwide', {useGrouping:true})

        let contractName = projectInfo.contractName;

        let _basicInfo = {
            name: projectInfo.name, 
            total_supply: `${noStr(hi.tokenTotalSupply)} ${contractName}`,
            creator: hi.creator,
            creator_balance: `${noStr(hi.creatorBalance)}  ${contractName}`
        }

        if(hi.owner && hi.owner.length > 0){
            _basicInfo["owner"] = hi.owner
            _basicInfo["owner_balance"] = `${noStr(hi.ownerBalance)} ${contractName}`
        }

        basicInfo.value = _basicInfo
    }catch(e){
        Utils.logError("scanner#initialize:",e)
        errorMsg.value = Utils.generalErrorMsg
    } finally {
        isLoading.value = false
    }
}

const onSubmit = async (_chainId, _contract) => {
    chainId.value = _chainId
    contract.value = _contract
    processScan()
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
                    <InlineError :text="errorMsg" />
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

                                <div class="accordion-item px-0 mx-0">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed px-2" 
                                            type="button" 
                                            data-bs-toggle="collapse" 
                                            data-bs-target="#p-scan-analysis" 
                                            aria-expanded="false" 
                                            aria-controls="p-scan-analysis"
                                        >
                                            <div class="fw-bold text-upper ls-2 hint fs-11">
                                                Project Analysis
                                            </div>
                                        </button>
                                    </h2>
                                    <div id="p-scan-analysis" 
                                        class="accordion-collapse collapse px-0 mx-0" 
                                        data-bs-parent="#scan-analysis"
                                    >
                                        <div class="accordion-body px-0">
                                            <ul class="list-group list-group-flush px-0 mx-0">
                                                <template v-for="item in projectIssues">
                                                    <li class="list-group-item py-4 mx-0 d-flex align-items-center">
                                                        <div  v-if="item.issues.length == 0">
                                                            <Icon 
                                                                name="clarity:success-standard-line" 
                                                                class="text-success"
                                                                :size="20" 
                                                            />
                                                        </div>
                                                        <div v-else>
                                                            <Icon 
                                                                name="ep:warning" 
                                                                class="text-danger"
                                                                :size="20" 
                                                            />
                                                        </div>
                                                       <div class="ms-2">{{ item.scwDescription }}</div>
                                                    </li>
                                                </template>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div class="accordion-item px-0 mx-0">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed px-2" 
                                            type="button" 
                                            data-bs-toggle="collapse" 
                                            data-bs-target="#h-analysis-collapse" 
                                            aria-expanded="false" 
                                            aria-controls="h-analysis-collapse"
                                        >
                                            <div class="fw-bold text-upper ls-2 hint fs-11">
                                                Holders Analysis
                                            </div>
                                        </button>
                                    </h2>
                                    <div id="h-analysis-collapse" 
                                        class="accordion-collapse collapse px-0 mx-0" 
                                        data-bs-parent="#scan-analysis"
                                    >
                                        <div class="accordion-body px-0">
                                            <ul class="list-group list-group-flush px-0 mx-0">
                                                <template v-for="item in scanResult.holdersInfo.issues">
                                                    <li class="list-group-item py-4 mx-0 d-flex align-items-center"
                                                        v-if="item.scwTitle != null || item.scwTitle != null"
                                                    >
                                                        <div  v-if="item.issues.length == 0">
                                                            <Icon 
                                                                name="clarity:success-standard-line" 
                                                                class="text-success"
                                                                :size="20" 
                                                            />
                                                        </div>
                                                        <div v-else>
                                                            <Icon 
                                                                name="ep:warning" 
                                                                class="text-danger"
                                                                :size="20" 
                                                            />
                                                        </div>
                                                        <div class="ms-2">
                                                            {{ 
                                                                (item.scwTitle != null && item.scwTitle != "") 
                                                                 ? scwTitle
                                                                 : scwDescription 
                                                            }}
                                                        </div>
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

</style>