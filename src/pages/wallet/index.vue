<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { inject, onBeforeMount, ref } from 'vue';
import WalletLayout from '../../layouts/WalletLayout.vue';
import ProfilePhoto from '../../components/common/ProfilePhoto.vue';
import Utils from '../../classes/Utils';
//import { useSettings } from '../../composables/useSettings';
import TokensAndActivityTabs from '../../components/wallet/TokensAndActivityTabs.vue';
//import { useNetworks } from '../../composables/useNetworks';

const botUtils = inject("botUtils")
const userInfo = ref({})
const name = ref("")
//const { fetchSettings } = useSettings()

onBeforeMount(() => {
    initialize()

    //nets.getExplorer(58)
})

const initialize = async() => {
    
    userInfo.value =  botUtils.getUserInfo() || {}
    let username = (userInfo.value.username || "").trim()
    name.value = (username.length > 0) ? '@'+username : userInfo.firstName; 

   // let settings  = await fetchSettings()
   // defaultCurrency.value = (settings.defaultCurrency || "usd").toLowerCase()

   // let tokens = await getTokens() 
   // nativeTokenInfo.value = tokens[Utils.nativeTokenAddr] 
}
</script>
<template>
    <WalletLayout
        title="Wallet"
        :has-footer="true"
    >
        <div class="px-10">
            <div class="card-body">
               <div class="max-w400">
                    <div class="d-flex justify-content-between align-items-center mt-3 mb-2 mx-2">
                        <div class="v-center">
                            <ProfilePhoto 
                                :user-id="`${userInfo.id}`" 
                                :size="26"
                                :rounded="false"
                            />
                            <div class="ps-2 d-flex align-items-center">
                                <div class="text-muted hint pe-1">Hi, </div>
                                <div class="text-truncate">
                                    {{ name }}
                                </div>
                            </div>
                        </div>
                        <div class="d-flex">
                            <NetworkSelect 
                                backUrl="/wallet" 
                                maxWidth="50vw"
                            />
                        </div>
                    </div>

                    <div class="mx-2">
                        <TokenBalanceCard :tokenAddress="Utils.nativeTokenAddr" />
                    </div>

                    <div class="mt-3 mx-2">
                        <TokensAndActivityTabs 
                            :limit="7"
                            :enableViewAllBtn="true"
                        />
                    </div>
               </div>
            </div>

        </div>
        
    </WalletLayout>
</template>