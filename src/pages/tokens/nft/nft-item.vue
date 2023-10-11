<route>
    { 
      name: "nft-item", 
      path: "/tokens/nft/item/:id([0-9a-zA-Z\-]+)" 
    }
</route>
<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useNFTs } from '../../../composables/useNFTs'

const route = useRoute()
const { getNFTById, removeNFT } = useNFTs()
const dbData = ref(null)
const initialized = ref(false)

onBeforeMount(()=>{
  initialize()
})

const initialize = async () => {

  dbData.value = await getNFTById(route.params.id)

  console.log("nftData.value==>", dbData.value)
}
</script>
<template>
    
</template>