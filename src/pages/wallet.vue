<script setup>
import { inject, onBeforeMount, ref } from 'vue';
import WalletLayout from '../layouts/WalletLayout.vue';
import ProfilePhoto from '../components/common/ProfilePhoto.vue';
import DefaultNetAndWallet from '../components/modals/default-network-and-wallet.vue';

const botUtils = inject("botUtils")
const userInfo = ref({})
const name = ref("")

onBeforeMount(() => {
    initialize()
})

const initialize = async => {
    userInfo.value =  botUtils.getUserInfo() || {}
    let username = (userInfo.value.username || "").trim()
    name.value = (username.length > 0) ? '@'+username : userInfo.firstName; 
}
</script>
<template>
    <WalletLayout
        title="Wallet"
    >
        <div class="px-10">
            <div class="card-body">
               <div class="max-w400  px-3">
                    <div class="d-flex justify-content-between align-items-center mt-3 mb-2">
                        <div class="d-flex align-items-center">
                            <ProfilePhoto :user-id="`${userInfo.id}`" :size="24" />
                            <div class="ps-2 d-flex align-items-center">
                                <div class="text-muted hint pe-1">Hi, </div>
                                <div class="text-truncate">{{ name }}</div>
                            </div>
                        </div>
                        <div>
                           <DefaultNetAndWallet  />
                        </div>
                    </div>
               </div>
            </div>
        </div>
        
    </WalletLayout>
</template>