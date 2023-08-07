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

                <div class="my-10 flex flex-col items-center w-full">
                    <k-button @click="router.push('/set-password?next=create-wallet')" rounded raised large 
                        class="btn mb-5"
                    >
                        Create Wallet
                    </k-button>
                    <k-button  @click="router.push('/set-password?next=import-wallet')" rounded  raised large 
                        class="k-color-secondary btn mb-5"
                    >
                        Import Wallet
                    </k-button>
                </div>
            </div>
        </k-block>
    </main-layout>
</template>
<style lang="scss" scoped>
    .logo { width: 100px; }
    .main-wrapper { height: 100%; }
</style>