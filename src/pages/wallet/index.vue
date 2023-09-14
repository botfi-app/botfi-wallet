<script setup>
import { inject, onBeforeMount, ref } from 'vue';
import WalletLayout from '../../layouts/WalletLayout.vue';
import ProfilePhoto from '../../components/common/ProfilePhoto.vue';
import DefaultNetAndWallet from '../../components/modals/DefaultNetAndWallet.vue';
import TokenList from '../../components/wallet/TokenList.vue';

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
                        <div class="v-center">
                            <ProfilePhoto :user-id="`${userInfo.id}`" :size="24" />
                            <div class="ps-2 d-flex align-items-center">
                                <div class="text-muted hint pe-1">Hi, </div>
                                <div class="text-truncate" style="max-width:100px;">
                                    {{ name }}
                                </div>
                            </div>
                        </div>
                        <div>
                           <DefaultNetAndWallet  />
                        </div>
                    </div>

                    <div class="rounded-lg bg-darken-5 center-vh px-2 py-4 mt-4 shadow">
                        <div>
                            <h1 class="text-center">20000</h1>
                            <div class="hint fs-6 text-center">
                                 1,000 USD
                            </div>
                        </div>
                    </div>

                    <div class="mt-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="hint fw-semibold">Tokens</div>
                            <div>
                                <router-link to="/tokens" 
                                    class="btn btn-outline-primary rounded-pill text-white"
                                >
                                   View All <Icon name="tabler:chevron-right" />
                                </router-link>
                            </div>
                        </div>
                        <TokenList 
                            :limit="10"
                        />
                    </div>
               </div>
            </div>
        </div>
        
    </WalletLayout>
</template>