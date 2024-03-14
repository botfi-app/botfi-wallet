<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from "../store/walletStore"
import { useRouter, useRoute } from 'vue-router';
import { useSimpleDB } from '../composables/useSimpleDB'
import Utils from "../classes/Utils"

const skipIntro = ref(false)  
const initialized = ref(false)
const walletStore = useWalletStore()
const router = useRouter()
const route  = useRoute()
const _db = useSimpleDB()

onBeforeMount(() => {

    initialize()
})

const initialize = async () => {
  
    skipIntro.value = (await _db.getItem("__skip_intro")) || false

    if((await walletStore.hasDefaultWallet())){
        router.push(`/login?next=${route.query.next || ''}`)
        return true;
    }

    initialized.value = true
}

const onIntroFinished = () => skipIntro.value = true
</script>
<template>
    <main-layout 
        title="BotFi Wallet"
        v-if="initialized"
        :center-content="true"
    >
        <IntroSlider 
            v-if="Utils.isPlatform('capacitor') && !skipIntro"
            @finish="onIntroFinished"
        />
        <div v-else class="d-flex flex-column w-400 px-4 auth-box align-items-center justify-content-center">
        
            <top-logo class="mt-5" />

            <div class="my-5 d-flex flex-column w-full align-items-center w-full mt-4">
                <router-link 
                    to="/set-pin?next=create-wallet" 
                    class="my-2 no-underline  w-full"
                    rel="prefetch"
                >
                    <button class="btn w-full btn-primary rounded-pill">
                        Create Wallet
                    </button>
                </router-link>
                <router-link  
                    to="/set-pin?next=import-wallet" 
                    class="my-2 no-underline  w-full"
                    rel="prefetch"
                >
                    <button class="btn w-full btn-warning rounded-pill">
                        Import Wallet
                    </button>
                </router-link>
            </div>
        </div>
    </main-layout>
</template>
