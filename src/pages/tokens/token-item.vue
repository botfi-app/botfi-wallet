<route>
    { 
      name: "token-item", 
      path: "/tokens/:contract(0x[a-fA-F0-9]{40})" 
    }
</route>
<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTokens } from '../../composables/useTokens'


const route = useRoute()
const initialized  = ref(false)
const tokenAddress = ref(null)
const tokenInfo    = ref(null)
const { getTokenByAddr } = useTokens()
const pageError = ref("")

onBeforeMount(() => {
  initialize()
})

const initialize = async () => {

  tokenAddress.value = route.params.contract; 

  //console.log("contractAddr===>", tokenAddress)

  tokenInfo.value = await getTokenByAddr(tokenAddress.value)

  //console.log("tokenInfo.value===>", tokenInfo.value)

  if(tokenInfo.value == null){
    return pageError.value = "Unknown token, kindly import it first"
  }
  

  if((tokenInfo.value.name || '') == ''){
    tokenInfo.value.name = tokenInfo.value.symbol;
  }

  //console.log("tokenInfo.value===>", tokenInfo.value)

  initialized.value = true
}
</script>
<template>
  <WalletLayout
    title=""
    :showNav="false"
    :hasNetSelect="false"
    :hasAddrSelect="false"
    :pageError="pageError"
    v-if="initialized && tokenInfo != null"
  >  

    <div class="w-400 mb-5">
      <div class='d-flex justify-content-between px-2'>
         
        <div class="center-vh">
          <NativeBackBtn 
            url="/tokens#tab-tokens"
          />
        
          <div class="center-vh">
            <Image
              :src="tokenInfo.image"
              :placeholder="tokenInfo.symbol"
              :width="22"
              :height="22"
              class="rounded-circle shadow me-2"
            />
            <div class="fw-semibold fs-6 pe-2 text-truncate">
              {{ tokenInfo.name }}
            </div>
          </div> 
        </div>

        <NetworkSelect backUrl="/tokens#tab-tokens" />
      </div>
      <div class="px-2">
        <TokenBalanceCard :tokenAddress="tokenAddress" />
      </div>

      <div class='mt-4'>
        <div class="fw-bold text-uppercase fs-12 hint muted ls-2 px-1 pb-3 px-2">
          Activity
        </div>

         <ActivityList :contract="tokenAddress" /> 
      </div>
    </div>

  </WalletLayout>

</template>