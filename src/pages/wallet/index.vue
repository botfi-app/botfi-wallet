<script>
  export default {
    name: 'wallet'
  }
</script>
<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { inject, onActivated, ref } from 'vue';
import WalletLayout from '../../layouts/WalletLayout.vue';
import ProfilePhoto from '../../components/common/ProfilePhoto.vue';
import Utils from '../../classes/Utils';
//import { useSettings } from '../../composables/useSettings';
import TokensAndActivityTabs from '../../components/wallet/TokensAndActivityTabs.vue';
//import { useNetworks } from '../../composables/useNetworks';

const botUtils = inject("botUtils")
const userInfo = ref({})
const name = ref("")
const initialized = ref(false)
//const { fetchSettings } = useSettings()

onActivated(() => {
    if(!initialized){
        initialize()
    }
    //nets.getExplorer(58)
})

const initialize = async() => {
    
    userInfo.value =  botUtils.getUserInfo() || {}
    let username = (userInfo.value.username || "").trim()
    name.value = ((username.length > 0) ? '@'+username : userInfo.firstName).trim(); 

    console.log("userInfo===>", userInfo)
   // let settings  = await fetchSettings()
   // defaultCurrency.value = (settings.defaultCurrency || "usd").toLowerCase()

   // let tokens = await getTokens() 
   // nativeTokenInfo.value = tokens[Utils.nativeTokenAddr] 
 
   initialized.value = true
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
                            <div class="d-flex align-items-center" 
                                v-if="Utils.isPlatform('telegram')"
                            >
                                <ProfilePhoto 
                                    :user-id="`${userInfo.id}`" 
                                    :size="24"
                                    :rounded="true"
                                />
                                
                                <div class="ps-1 text-truncate" v-if="name != ''">
                                    Hi, {{ name }}
                                </div>
                                <div class="ps-1 text-truncate" v-else>Welcome</div>
                            </div>
                            <div v-else>
                                <div class="rounded-lg p-1 shadow center-vh">
                                    <img src="/images/svg/logo.svg" width="28" />
                                </div>
                            </div>
                        </div>
                        <div class="d-flex center-vh">
                            <NetworkSelect 
                                backUrl="/wallet" 
                                maxWidth="50vw"
                            />
                            <!--                            <router-link to="/setting" 
                                rel="prefetch"
                                class="btn btn-icon rounded-circle bg-dark-3 ms-2 op-80"
                            >
                                <Icon 
                                    name="solar:scanner-line-duotone" 
                                    :size="24" 
                                />
                            </router-link>
                            -->
                            <router-link to="/settings" 
                                rel="prefetch"
                                class="btn btn-icon rounded-circle bg-dark-3 ms-2"
                            >
                                <Icon name="codicon:settings" :size="24" class="op-60" />
                            </router-link>
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
<style lang="scss">

</style>