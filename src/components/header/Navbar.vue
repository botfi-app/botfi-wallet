<script setup>

import { useNetworks } from '../../composables/useNetworks';
import Image from '../common/Image.vue';

const props = defineProps({
    title: { type: String, default: "" },
    hasNetSelect: { type: Boolean, default: true },
    hasAddrSelect: { type: Boolean, default: true },
    icon: {type: String, default: '' }
})

const { isNetReady, activeNetwork } = useNetworks()

</script>
<template>
    <div>
        <div class="d-flex p-2 px-3 align-items-center justify-content-between flex-nowrap">
            <div class="fw-semibold fs-6 pe-2 text-truncate"  style="max-width: 40vw;">
                {{ props.title }} 
            </div>
           <button v-if="isNetReady && hasNetSelect" 
                class="btn net-select-btn px-2 rounded-pill my-2 text-truncate"
                data-bs-toggle="modal" 
                data-bs-target="#acctNetSelectModal"
                style="max-width: 55vw;"
            >
                <div class="d-flex align-items-center justify-content-center flex-nowrap">
                    <Image 
                        :width="24" 
                        :height="24" 
                        class="rounded-circle shadow"
                        :src="activeNetwork.icon" 
                        :placeholder="activeNetwork.name"
                    />
                    <div class="ms-2 me-2 a text-truncate fs-6">
                        {{ activeNetwork.name }}
                    </div>
                    <div>
                        <Icon name="charm:chevron-down" :size="20" />
                    </div>
                </div>
           </button>
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