<script setup>
import { onBeforeMount } from 'vue';
import { useWalletStore } from '../store/walletStore';
import { useRouter } from 'vue-router';

const props = defineProps({
    title: { type: String, default: ''}
})

const walletStore = useWalletStore()
const router = useRouter()
const initialized = ref(false)
const defaultWallet = ref()
const accounts = ref({})

onBeforeMount(() => {

    if(!walletStore.isLoggedIn()){
        return router.push("/")
    }

    // lets fetch default account
    defaultWallet.value = walletStore.defaultWallet
    accounts.value = walletStore.accounts

    initialized.value = true
})

</script>
<template>
     <k-page v-if="initialized">
        <k-navbar 
            :title="props.title"
            :centerTitle="true"
        >
            <template #left>
                <a href="#" @click.prevent class="px-2">
                    <Icon name="ri:menu-4-fill" size="24" />
                </a>
            </template>
            <template #right>
                <div class="flex px-2">
                    <Icon name="iconamoon:notification-light" size="24" />
                </div>
            </template>
        </k-navbar>
        <slot />
        <TabBar />
    </k-page>
</template>