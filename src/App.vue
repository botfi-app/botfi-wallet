<script setup>
import { useWalletStore } from './store/walletStore';
import { useTokens } from './composables/useTokens';
import { onBeforeMount, ref, onMounted } from 'vue';
import EventBus from './classes/EventBus';
import { useRouter } from 'vue-router';


const walletStore = useWalletStore()
  const tokensCore = useTokens()
const isUpdatingBalance = ref(false); 
const router = useRouter()

onBeforeMount(() => {

  updateBalances()
  setInterval(()=> updateBalances(), 30_000);

  EventBus.on("login", () => updateBalances())
  EventBus.on("update-balance",  () => updateBalances())

})


const updateBalances = async() => {

 //console.log("window.app_platform===>", window.app_platform)
  
  if(!walletStore.isLoggedIn() || isUpdatingBalance.value == true) return;
  
  isUpdatingBalance.value = true 

  let addresses = await walletStore.getWalletAddresses()

  let updateStatus = await tokensCore.updateBalances(addresses)

  //console.log("updateStatus==>", updateStatus)

  isUpdatingBalance.value = false
}

const keepAliveIncludes = [
  //'wallet'
] 

if(window.app_platform == 'capacitor'){
  keepAliveIncludes.push(...[
      'browser',
      'connected-sites', 
      'browser-menu',
      'browser-tabs'
  ])
}
</script>

<template>
  <router-view v-slot="{ Component, route }">
      <KeepAlive :include="keepAliveIncludes">
        <component :is="Component" />
      </KeepAlive>
  </router-view>
  
  <toast />
</template>
