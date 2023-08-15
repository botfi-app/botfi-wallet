<script setup>
import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from "../store/walletStore"
import { useRouter } from 'vue-router';

const initialized = ref(false)
const walletStore = useWalletStore()
const router = useRouter()

onBeforeMount(() => {
    initialize()
})

const initialize = () => {
    if(walletStore.hasDefaultWallet()){
        router.push('/login')
    }

    initialized.value = true
}
</script>
<template>
    <main-layout 
        :showBackBtn="false" 
        title="BotFi Wallet"
        v-if="initialized"
        :center-content="true"
    >
        <div class="d-flex flex-column w-400 px-5 align-items-center">
        
            <top-logo />

            <div class="my-10 d-flex flex-column w-full align-items-center w-full">
                <router-link 
                    to="/set-pin?next=create-wallet" 
                    class="btn w-full btn-primary btn-lg rounded-pill my-2"
                >
                    Create Wallet
                </router-link>
                <router-link  
                    to="/set-pin?next=import-wallet" 
                    class="btn w-full btn-lg btn-secondary rounded-pill mb-5"
                >
                    Import Wallet
                </router-link>
            </div>
        </div>
    </main-layout>
</template>
