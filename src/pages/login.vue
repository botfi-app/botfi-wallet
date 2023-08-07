<script setup>
import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from "../store/walletStore"
import { useRouter } from 'vue-router';

const initialized = ref(false)
const walletStore = useWalletStore()
const router = useRouter()
const password = ref("")

onBeforeMount(() => {
    initialize()
})

const initialize = () => {

    if(!walletStore.hasDefaultWallet()){
        router.push('/')
    }

    initialized.value = true 
}

const handleLogin = async () => {
    
}
</script>
<template>
    <main-layout 
        :showBackBtn="false"
        title="BotFi Wallet"
        :centerTitle="true"
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

                <k-list  class="p-0 w-full">
                    <k-list-input
                        label="Password"
                        floating-label
                        type="password"
                        placeholder="Enter Password"
                        @input="e=> password = e.target.value"
                        class="mx-0"
                    />
                </k-list>
                <div class="mb-5 flex flex-col items-center w-full">
                    <k-button rounded raised large 
                        class="btn mb-5"
                    >
                        Login
                    </k-button>
                    <k-button  rounded  raised large 
                        class="k-color-secondary btn mb-5"
                    >
                        Reset Account
                    </k-button>
                </div>
            </div>
        </k-block>
    </main-layout>
</template>
