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

    let histoyDataStr = localStorage.getItem(sk) || "[]"
    let historyArr = []

    try{ historyArr = JSON.parse(histoyDataStr) } catch(e){}

    if(historyArr.length == 0) return;

    //console.log("historyObj===>", historyObj)
    scanHistory.value = historyArr
}
</script>
<template>
    <WalletLayout
        title=""
        :has-footer="true"
        :has-header="false"
    >

        <div class="w-800 mb-5 pt-2 px-2">
            <div class="d-flex align-items-center justify-content-between flex-nowrap">
                <div class="center-vh">
                    <NativeBackBtn url="/wallet" />
                    <div class="fw-semibold fs-6">Scanner</div>
                </div>
                <div>
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
                <div class="fw-bold text-upper ls-2 hint fs-11 mt-2">
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
                                <div class="d-flex w-100 justify-content-between flex-wrap">
                                    <div class="mb-1 text-truncate fw-semibold">{{ item.name }}</div>
                                    <small class="text-capitalize text-truncate hint">{{ item.chainName }}</small>
                                </div>
                                <small class="hint break-text">
                                    {{ item.contract }}
                                </small>
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