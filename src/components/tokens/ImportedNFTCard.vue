<script setup>
const props = defineProps({
    data: { type: Object, default: {} }
})

onBeforeMount( async() => {
    initialize()
})

const initialize = async () => {
    imgUrl.value = Utils.getNFTPreviewUrl(props.data, "small")   
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
                <div class="fw-bold fs-12 hint font-monospace text-truncate">
                    #{{ item.tokenId }}
                </div>
                <div class="fw-medium item-title text-truncate-multiline text-break">
                    {{ item.name }}
                </div>
                <button @click.prevent="doImportNFT"
                    class="btn btn-primary mt-2 btn-sm rounded-pill fs-12"
                    :disabled="nftExistsInDb"
                >
                    <div v-if="nftExistsInDb" class='fst-italic fw-semibold'>Imported</div>
                    <div v-else class="fw-bold">Import NFT</div>
                </button>
            </div>
        </div>
    </div>
</template>
