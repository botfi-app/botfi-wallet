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
const nftInfo = ref(null)
const initialized = ref(false)
const isLoading = ref(false)
const pageError = ref("")

onBeforeMount(()=>{
  initialize()
})

const initialize = async () => {

  dbData.value = await getNFTById(route.params.id)

  if(dbData.value != null){
    pageError.value = "NFT item not found"
    return false
  }
  console.log("nftData.value==>", dbData.value)
}
</script>
<template>
    <WalletLayout
      title=""
      :showNav="false"
      :hasNetSelect="true"
      :hasAddrSelect="false"
    >   
        <NativeBackBtn 
          url="/tokens#t-nfts"
        />

        <div class="w-400 mb-5">
          <div v-if="dbData != null && nftInfo != null">

            <div class="d-flex justify-content-center p-2">
              <img 
                class="collection-preview rounded-lg shadow"
                :src="Utils.getNFTPreviewUrl(nftInfo, 'large')"
                loading="lazy"
              />
            </div>
            <div class="text-justify description mt-2 mx-3">
              <CollapsibleText 
                :content="nftInfo.description" 
                :lines="2"
              />
            </div>
          </div>
        </div>
    </WalletLayout>
</template>