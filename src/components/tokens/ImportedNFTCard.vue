<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';

const props = defineProps({
    data: { type: Object, default: {} }
})

const emits = defineEmits(['remove-nft'])

const nftInfo = ref(props.data.nftInfo)
const imgUrl = ref("")

onBeforeMount( async() => {
    initialize()
})

const initialize = async () => {
    //console.log("nftInfo===>", nftInfo)
    imgUrl.value = Utils.getNFTPreviewUrl(nftInfo.value, "small")   
}
</script>
<template>
    <div class="nft-collection-card">
        <div class="card-header" :style="{'background-image': `url(${imgUrl})` }">
            <div class="card-header-img">
                <router-link 
                    :to="`/tokens/nft/item/${props.data.id}`"
                    class='nft-bg-img' 
                    :style="`background-image: url(${imgUrl})`"
                >
                    <div  />
                </router-link>
            </div>
        </div>  
        <router-link 
            :to="`/tokens/nft/item/${props.data.id}`" 
            class="p-2 text-center flex-grow-1 d-flex align-items-center justify-content-center"
        >
            <div class="px-2">
                <div class="fw-semibold hint col-name fs-11 text-uppercase text-truncate">
                    {{ nftInfo.collectionInfo.name }}
                </div>
                <div class="fw-medium item-title text-truncate">
                    {{ nftInfo.name }}
                </div>
                <div class="fw-semibold hint fs-12 text-uppercase text-truncate">
                    ID: {{ nftInfo.tokenId }}
                </div>
            </div>
        </router-link>
        <div class="d-flex justify-content-between m-2 align-items-center">
            <a href="#" @click.prevent 
              class="btn btn-none rounded btn-sm btn-supply text-truncate"
            >
                {{ nftInfo.balanceDecimal }}
            </a>
            <a href="#" @click.prevent 
                class="ps-2"
                data-bs-toggle="dropdown" 
                aria-expanded="false"
            >
                <Icon name="ri:more-2-fill" />
            </a>
            <ul class="dropdown-menu shadow rounded py-0 my-0">
                <li>
                    <a  @click.prevent="emits('remove-nft', props.data.id)"
                        class="dropdown-item py-3" 
                        href="#"
                    >
                        <div class="d-flex align-items-center">
                            <Icon name="mdi:delete" class="text-danger" />
                            <div class="ms-1">Remove</div>
                        </div>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.col-name {
    letter-spacing: 2px;
}

.btn-supply {
    //background: var(--bs-body-bg-light-2);
    background: rgba(var(--bs-primary-rgb), 0.25);
}
</style>