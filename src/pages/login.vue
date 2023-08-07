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
}

const handleLogin = async () => {
    
}
</script>
<template>
    <main-layout 
        :showBackBtn="false"
        :rightBtn="{text: 'Login', class: '', onClick: handleLogin }"
        title="BotFi Wallet"
        v-if="initialized"
    >
       
        <k-block strong inset class="">
            <div class="flex flex-col w-full items-center">
            
                <div class="flex justify-center">
                    <img 
                        src="/images/svg/logo.svg" 
                        class="logo mt-5 animate__animated animate__pulse animate__slow animate__infinite	infinite" 
                        alt="" 
                    />
                </div>

               
            </div>
        </k-block>
    </main-layout>
</template>
