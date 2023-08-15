<script setup>
import { onBeforeMount, ref } from 'vue';
import Avatar from "../common/Avatar.vue";
import Utils from "../../classes/Utils"
import { useWalletStore } from '../../store/walletStore';
import SidePanel from './SidePanel.vue';

const props = defineProps({
    title: { type: String, default: ''}
})

const walletStore = useWalletStore()
const accounts = ref({})
const selectedAccount = ref(null)
const isSidePanelOpened = ref(false)

onBeforeMount(() => {
    accounts.value = walletStore.accounts;
    selectedAccount.value = accounts.value[Object.keys(accounts.value)[0]]
})
</script>
<template>
    <k-navbar 
        :title="props.title"
        :centerTitle="false"
    >
        <template #right>
            <div class="flex px-2 items-center">
                
                <div class="ms-2 px-0">
                    <k-button rounded raised medium tonal class="flex flex-row ps-1 k-color-secondary">
                        <Avatar 
                            :size="32" 
                            :name="selectedAccount.name"
                            class="shadow-lg"
                        />
                        <div class="mx-2">
                            {{ Utils.maskAddress(selectedAccount.wallet.address) }}
                        </div>
                    </k-button>
                </div>
                
            </div>
        </template>
    </k-navbar>
</template>