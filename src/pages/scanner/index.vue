<script setup>
import { useRouter } from 'vue-router'
import { ref, inject, onBeforeMount } from 'vue';

const router = useRouter()
const scanHistory = ref([])
const botUtils = inject("botUtils")

const handleSubmit = (chainId, chainName, contract) => {
    router.push(`/scanner/result/${chainId}/${chainName}/${contract}`)
}

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {

    let sk = `${botUtils.getUid()}_scan_history`

    let histoyDataStr = localStorage.getItem(sk) || "{}"
    let historyArr = {}

    try{ historyArr = JSON.parse(histoyDataStr) } catch(e){}

    //console.log("historyObj===>", historyObj)
    scanHistory.value = historyArr
}
</script>
<template>
    <WalletLayout
        title=""
        :has-footer="false"
        :has-header="false"
    >

        <NativeBackBtn url="/wallet" />

        <div class="w-400 mb-5">
            <div class="d-flex p-2 align-items-center justify-content-between flex-nowrap">
                <div class="fw-semibold fs-6 pe-2">Scanner</div>
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
            <div class="scan-history">
                <div class="fw-bold text-upper ls-2 hint fs-11 mt-2 mx-2">
                    Scan History
                </div>
                <div v-if="scanHistory.length == 0">
                    <NoResults />
                </div>
                <div v-else>
                    <ul class="list-group  mt-3">
                        <template v-for="(item, index) in scanHistory">
                            <router-link :to="`/scanner/result/${item.chainId}/${item.chainName}/${item.contract}`" 
                                class="list-group-item list-group-item-action py-3"
                            >
                                <div class="d-flex w-100 justify-content-between">
                                    <h5 class="mb-1">{{ item.name }}</h5>
                                    <small class="text-capitalize hint">{{ item.chainName }}</small>
                                </div>
                                <small class="hint">{{ item.contract }}</small>
                            </router-link>
                        </template>
                    </ul>
                </div>
            </div>
        </div>
    </WalletLayout>
    <NewScanModal
        @submit="handleSubmit"
    />
</template> 
<style lang="scss">

</style>