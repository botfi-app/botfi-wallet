<script setup>
import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from '../store/walletStore';
import { useRouter } from 'vue-router';
import Avatar from "../components/common/Avatar.vue";
import Utils from "../classes/Utils"

const props = defineProps({
    title: { type: String, default: ''}
})

const walletStore = useWalletStore()
const router = useRouter()
const initialized = ref(false)
const defaultWallet = ref()
const accounts = ref({})
const selectedAccount = ref()

onBeforeMount(() => {

    if(!walletStore.isLoggedIn()){
        return router.push("/login")
    }

    // lets fetch default account
    defaultWallet.value = walletStore.defaultWallet
    accounts.value = walletStore.accounts
    
    selectedAccount.value = accounts.value[Object.keys(accounts.value)[0]]

   // console.log("selectedAccount===>", selectedAccount.value)

    initialized.value = true
})

</script>
<template>
     <k-page v-if="initialized">
        <k-navbar 
            :title="props.title"
            :centerTitle="false"
        >
            <template #left>
                <a href="#" @click.prevent class="px-2">
                    <Icon name="ri:menu-4-fill" :size="24" />
                </a>
            </template>
            <template #right>
                <div class="flex px-2 items-center">
                    <div class="mx-2 px-0">
                        <k-button rounded large tonal class="flex flex-row ps-1 k-color-secondary">
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
                    <Icon name="iconamoon:notification-light" :size="24" />
                </div>
            </template>
        </k-navbar>
        <slot />
        <TabBar />
    </k-page>
</template>
<style>
.addr-btn { padding: 0px !important; }
</style>