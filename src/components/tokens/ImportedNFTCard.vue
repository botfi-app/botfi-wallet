<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';

const props = defineProps({
    data: { type: Object, default: {} }
})

const nftInfo = ref(props.data.nftInfo)
const imgUrl = ref("")

onBeforeMount( async() => {
    initialize()
})

const initialize = async () => {
    imgUrl.value = Utils.getNFTPreviewUrl(nftInfo.value, "small")   
}

const doRemoveNFT = async () => {

}
</script>
<template>
    <div class="nft-collection-card">
        <div class="card-header" :style="{'background-image': `url(${imgUrl})` }">
            <div class="card-header-img">
                <img 
                    v-lazy="imgUrl" 
                    alt=""
                />
            </div>
        </div>
        <div class="p-2 text-center flex-grow-1 d-flex align-items-center justify-content-center">
            <div class="px-2">
                <div class="fw-semibold hint col-name fs-11 text-uppercase text-truncate">
                    {{ nftInfo.collectionInfo.name }}
                </div>
                <div class="fw-medium item-title text-truncate-multiline text-break">
                    {{ nftInfo.name }}
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.col-name {
    letter-spacing: 2px;
}
</style>