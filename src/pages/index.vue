<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from "../store/walletStore"
import { useRouter, useRoute } from 'vue-router';

const initialized = ref(false)
const walletStore = useWalletStore()
const router = useRouter()
const route  = useRoute()

onBeforeMount(() => {
    initialize()
})

const initialize = async () => {

    if((await walletStore.hasDefaultWallet())){
        router.push(`/login?next=${route.query.next || ''}`)
        return true;
    }

    initialized.value = true
}
</script>
<template>
    <main-layout 
        title="BotFi Wallet"
        v-if="initialized"
        :center-content="true"
    >
        <div class="d-flex flex-column w-400 px-5 align-items-center">
        
            <top-logo />

            <div class="my-5 d-flex flex-column w-full align-items-center w-full">
                <router-link 
                    to="/set-pin?next=create-wallet" 
                    class="my-2 no-underline  w-full"
                    rel="prefetch"
                >
                    <button class="btn w-full btn-primary rounded-pill ">
                        Create Wallet
                    </button>
                </router-link>
                <router-link  
                    to="/set-pin?next=import-wallet" 
                    class="my-2 no-underline  w-full"
                    rel="prefetch"
                >
                    <button class="btn w-full btn-success rounded-pill">
                        Import Wallet
                    </button>
                </router-link>
            </div>
        </div>
    </main-layout>
</template>
