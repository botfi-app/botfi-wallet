<route>
    { 
      name: "token-item", 
      path: "/tokens/item/:contract(0x[a-fA-F0-9]{40})" 
    }
</route>
<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTokens } from '../../composables/useTokens'
import Utils from '../../classes/Utils';
import { useNetworks } from '../../composables/useNetworks';
import { useWalletStore } from '../../store/walletStore';

const route = useRoute()
const initialized = ref(false)
const tokenAddress = ref(null)
const tokenInfo = ref(null)

onBeforeMount(() => {
  initialize()
})

const initialize = async () => {

  tokenAddress.value = route.params.contract; 

  console.log("contractAddr===>", tokenAddress)

  initialized.value = true
}
</script>
<template>
  <WalletLayout
    title=""
    :showNav="false"
    :hasNetSelect="false"
    :hasAddrSelect="false"
    v-if="initialized"
  >   

    <NativeBackBtn 
      url="/tokens#tab-tokens"
    />

    <div class="w-400 mb-5">
      <div class='d-flex justify-content-between'>
        <div class="center-vh">
          
        </div>  
      </div>
      <div class="px-2">
        <TokenBalanceCard :tokenAddress="tokenAddress" />
      </div>
    </div>

  </WalletLayout>

</template>