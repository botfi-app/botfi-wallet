<script setup>

const props = defineProps({
    title: { type: String, default: "" },
    hasNetSelect: { type: Boolean, default: true },
    hasAddrSelect: { type: Boolean, default: true },
    icon: {type: String, default: '' }
})

</script>
<template>
    <div>
        <div class="d-flex p-2 px-3 align-items-center justify-content-between flex-nowrap">
            <div class="fw-semibold fs-6 pe-2 text-truncate"  style="max-width: 40vw;">
                {{ props.title }} 
            </div>
           <NetworkSelect v-if="hasNetSelect" />
           <Icon v-else-if="props.icon != ''" :name="props.icon"  class="text-primary" />
        </div>
        <div class="px-3 mb-2 w-full" v-if="props.hasAddrSelect">
            <WalletSelect />
        </div>

        <DefaultNetAndWallet />
    </div>
</template>
<style scoped lang="scss">
.addr-select-btn {
    //border-color: var(--bs-primary) !important;
    //color: var(--bs-body-color);
    //line-height: 20px;
}
</style>