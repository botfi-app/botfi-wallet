<script setup>
import { inject, onBeforeMount, ref } from 'vue';
import WalletLayout from '../layouts/WalletLayout.vue';
import ProfilePhoto from '../components/common/ProfilePhoto.vue';

const botUtils = inject("botUtils")
const userInfo = ref({})

onBeforeMount(() => {
    initialize()
})

const initialize = async => {
    userInfo.value =  botUtils.getUserInfo() || {}
}
</script>
<template>
    <WalletLayout
        title="Wallet"
    >
        <div class="px-10">
            <div class="card-body">
               <div class="max-w400 text-center">
                <div class="d-flex justify-content-between align-items-center  px-3 my-4">
                    <div>
                        <h1 class="fw-semibold p-0 m-0">Hello, {{ userInfo.firstName }}</h1>
                    </div>
                    <div>
                        <ProfilePhoto :user-id="userInfo.id" />
                    </div>
                </div>
                 <h4 class="text-md font-bold">Balance</h4>
               </div>
            </div>
        </div>
        
        <TabBar />
    </WalletLayout>
</template>