<script setup>
import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from '../store/walletStore';
import { useRouter } from 'vue-router';
import Navbar from '../components/wallet/Navbar.vue';


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
        <Navbar :title="props.title" />
        <slot />
        <TabBar />
    </k-page>
</template>
<style>
.addr-btn { padding: 0px !important; }
</style>