<script setup>

import { onBeforeMount, ref } from 'vue'

onBeforeMount(() => {
  
})

</script>
<template>
    <WalletLayout
        title="Settings"
        :showNav="true"
        :hasNetSelect="false"
        :hasAddrSelect="false"
    >   

        <NativeBackBtn url="/" />

        <div class="w-400 mb-5">

        </div>

        <BottomNav />
    </WalletLayout>
</template>