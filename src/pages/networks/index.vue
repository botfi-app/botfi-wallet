
<script setup>
import { inject, onBeforeMount, onMounted, ref, toValue } from 'vue';
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import WalletLayout from '../../layouts/WalletLayout.vue';

const $emits = defineEmits(['initialized','change'])

const initialized = ref(false)
const activeNetInfo = ref({})
const allNetworks = ref({})
const walletStore = useWalletStore()

const initialize = async () => {

    let userNetworks = await walletStore.getUserNetworks()    
    activeNetInfo.value = userNetworks.networks[userNetworks.default]
    allNetworks.value = userNetworks.networks

    $emits("change", activeNetInfo.value)

    initialized.value = true
}

onBeforeMount(() => {
    initialize()
})

</script>
<template>
    <WalletLayout
        title="Networks"
        :show-nav="false"
        v-if="initialized"
        :has-back-btn="true"
    >
        <div class="w-400">
            
            <loading-view :isLoading="isLoading">
                <ul class="list-group list-group-flush w-full">
                    <li v-for="(item,index) in allNetworks" 
                        class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                        :key="index"
                        @click.prevent="handleOptionClick(item)"
                    >
                        <div class="d-flex">
                            <Icon name="clarity:check-line" 
                                :size="24"
                                v-if="selectedItem != '' && selectedItem == item.value"
                                class="me-2 text-success"
                            />
                            <div>{{ item.text }}</div>
                        </div>
                        <Image 
                            :width="28"
                            :height="28"
                            :src="Utils.getTokenIconUrl(item.symbol)" 
                            alt=""
                            v-if="item.iconUrl && item.iconUrl != ''"
                            :placeholder="item.text.charAt(0)"
                            class="rounded-circle mselect-icon"
                        />
                    </li>
                </ul>
            </loading-view>
        </div>
    </WalletLayout>
</template>