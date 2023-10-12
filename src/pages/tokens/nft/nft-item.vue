<route>
    { 
      name: "nft-item", 
      path: "/tokens/nft/item/:id([0-9a-zA-Z\-]+)" 
    }
</route>
<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNFTs } from '../../../composables/useNFTs'
import Utils from '../../../classes/Utils';
import { useNetworks } from '../../../composables/useNetworks';
import { useWalletStore } from '../../../store/walletStore';


const route = useRoute()
const router = useRouter()
const { getNFTById, removeNFT, getNFTs } = useNFTs()
const  { getActiveNetworkInfo }  = useNetworks()
const  {  getActiveWalletInfo } = useWalletStore()
const dbData = ref(null)
const nftInfo = ref(null)
const pageError = ref("")
const isOwner = ref(false)

onBeforeMount(()=>{
  initialize()
})

const initialize = async () => {

  dbData.value = await getNFTById(route.params.id)

  if(dbData.value == null){
    pageError.value = "NFT item not found"
    return false
  }

  let _nf = dbData.value.nftInfo;

  let activeNetworkInfo = await getActiveNetworkInfo()

  //console.log("activeNet===>", activeNet)
  _nf.chain  = `${activeNetworkInfo.name} (${_nf.chainId})`
          
  _nf = {..._nf, 
          contract: _nf.collection,
          collectionName: _nf.collectionInfo.name 
        }
  
  let activeWallet = (await getActiveWalletInfo()).address.toLowerCase()

 // let nftWallet = dbData.value.wallet.toLowerCase()
  let nftOwner = (_nf.owner || "").toLowerCase().trim()

 isOwner.value = (nftOwner != '' && nftOwner == activeWallet)

  nftInfo.value = _nf
}

const keyText = {
  "tokenId": "Token ID", 
  "collectionName": "Collection",
  "balanceDecimal": "Balance"
}

const doRemoveNFT = async () => {

  let loader;

  try {

      let _nft = nftInfo.value

      let html = `${_nft.name} (id: ${_nft.tokenId}) will be removed`

      let action =   await Utils.getSwal().fire({
                          showCancelButton: true,
                          confirmButtonText: 'Confirm',
                          denyButtonText:    'Cancel',
                          html,
                          title: "Confirm Action",
                      })

      if(!action.isConfirmed) return;
                      
      loader = Utils.loader(`Removing ${_nft.name} (id: ${_nft.tokenId})`)

      let resultStatus = await removeNFT(dbData.value.id)

      if(resultStatus.isError()){
          return Utils.errorAlert(resultStatus.getMessage())
      }   
      
      await getNFTs()

      Utils.toast(`NFT item removed`)

      router.push('/tokens#tab-nfts')

  } catch(e){
      Utils.logError(`nft-item#doRemoveNFT:`, e) 
      Utils.errorAlert(Utils.generalErrorMsg)
  } finally {
      if(loader) loader.close()
  }
}

const sendNFT = () => {

  if(!isOwner.value){
    return Utils.toast("only owner can send")
  }

}
</script>
<template>
    <WalletLayout
      title=""
      :showNav="false"
      :hasNetSelect="true"
      :hasAddrSelect="false"
      :pageError="pageError"
    >   
        <NativeBackBtn 
          url="/tokens#tab-nfts"
        />

        <div class="w-400 mb-5">
          <div v-if="dbData != null && nftInfo != null">

            <div class="d-flex justify-content-center p-2">
              <img 
                class="nft-preview rounded-lg shadow"
                :src="Utils.getNFTPreviewUrl(nftInfo, 'large')"
              />
            </div>
            <div class="text-justify description mt-2 mx-3">
              <CollapsibleText 
                :content="nftInfo.description" 
                :lines="2"
              />
            </div>

            <div class="mb-4 px-2 d-flex w-full action-btns">
              <div class="p-1">
                <button 
                  :disable="!isOwner"
                  class="btn btn btn-success rounded-lg w-full"
                  @click.prevent="sendNFT"
                >
                  Send
                </button>
              </div>
              <div class="p-1">
                <button class="btn btn btn-warning rounded-lg w-full" :disable="true">
                   <div class="d-flex center-vh">
                      <div v-if="isOwner">Sell</div>
                      <div v-else>Buy</div>
                      <div class="fs-10 fw-bold ps-1">(Coming Soon)</div>
                    </div>
                </button>
              </div>
            </div>

            <div class="mt-2 mb-5 px-3">
              <div class="d-flex justify-content-between align-items-center">
                  <div class="fw-bold text-uppercase fs-12 text-primary ls-2">
                      Details
                  </div>
              </div>
              <div>
                  <template v-for="(value,key) in nftInfo">
                      <div class="py-2 mt-2 details d-flex justify-content-between align-items-center"
                          v-if="['name', 
                                 'symbol', 
                                 'standard', 
                                 'contract', 
                                 'collection_name', 
                                 'chain',
                                 'owner',
                                 'balanceDecimal',
                                 'tokenId',
                                 'supply'
                                ].includes(key) && value.toString().trim() != ''"
                      > 
                          <div class="text-uppercase hint fs-10 key text-start fw-bold pe-2">
                             {{ (keyText[key] || key).replace("_", " ") }}
                          </div>
                          
                          <div class='value contract text-break fs-14 ps-2 text-end fw-medium'>
                            <div class="d-flex justify-content-end w-full" 
                              v-if="['contract', 'owner'].includes(key)" 
                            >
                                <CopyBtn :text="value" btnClasses="text-primary" />
                                <div>{{ value }}</div>    
                            </div>
                            <div v-else-if="key == 'colectionName'">
                              <router-link :to="`/tokens/nft/collection/${nftInfo.chainId}/${nftInfo.collection}`">
                                {{  value }} 
                              </router-link>
                            </div>
                            <div v-else class='value text-break fs-14 ps-2 text-end fw-medium'>
                              {{ value }}
                            </div>
                          </div>
                      </div>
                  </template>
              </div>
            </div>

            <MainBtn text="Remove NFT" :onClick="doRemoveNFT" />
          </div>
        </div>
    </WalletLayout>
</template>
<style lang="scss" scoped>

.nft-preview {
    width: 100%;
    max-height: 60vh;
}
.action-btns {
  > div{
    flex-grow: 1;
    flex-basis: 0;
    min-width: 0;
  }
}

.details {
  .key {
    max-width: 30%;
  }

  .value {
    max-width: 64vw;
  }
}

</style>