<script setup>

import { useNetworks } from '../../composables/useNetworks';
import Image from '../common/Image.vue';
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import Avatar from '../common/Avatar.vue';

const props = defineProps({
    title: { type: String, default: "" },
    hasNetSelect: { type: Boolean, default: true },
    hasAddrSelect: { type: Boolean, default: true },
})

const { isNetReady, activeNetwork } = useNetworks()
const walletStore = useWalletStore()
const { activeWallet } = walletStore

</script>
<template>
    <div>
        <div class="d-flex p-2 px-3 align-items-center justify-content-between flex-nowrap">
            <div class="fw-semibold fs-6 pe-2 text-truncate"  style="max-width: 40vw;">
                {{ props.title }} 
            </div>
           <button v-if="isNetReady" 
                class="btn net-select-btn px-2 pe-3 rounded-pill my-2 text-truncate"
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
        </div>
        <div class=" w-full px-3 mb-2" v-if="props.hasAddrSelect">
            <button class="btn py-2 btn-outline-primary rounded w-full d-block addr-select-btn" 
                v-if="activeWallet"
                data-bs-toggle="modal" 
                data-bs-target="#acctNetSelectModal"
            >
                <div class="d-flex align-items-center justify-content-between fs-16">

                    <div class="d-flex align-items-center mw-50vw">
                        <Avatar 
                            :name="activeWallet.address" 
                            :square="true" 
                            :size="20" 
                            variant="ring"
                            class="rounded me-2"
                        />
                        <div class="text-light me-2 fw-normal text-truncate flex-grow-1">
                            {{ activeWallet.name }}
                        </div>
                    </div>

                    <div class="font-monospace">
                        {{  Utils.maskAddress(activeWallet.address, 6, 6)  }}
                    </div>
                </div>
            </button>
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