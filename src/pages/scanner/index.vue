<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleSubmit = (chainId, contract) => {
    router.push(`/scanner/result/${chainId}/${contract}`)
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
        </div>
    </WalletLayout>
    <NewScanModal
        @submit="handleSubmit"
    />
</template> 