<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';
//import Image from '../common/Image.vue';


const props = defineProps({
    data: { type: Object, default: {} }
})

const imgUrl = ref("")
const item = ref(props.data)

onBeforeMount(() => {

   // console.log("props.data==>", props.data)

    //let image = (props.data.media || {}).image || {}
    imgUrl.value = Utils.getNFTPreviewUrl(props.data, "small")
    
})

</script>
<template>
    <router-link 
        :to="`/tokens/nft/collection/${item.chainId}/${item.contract}`" 
        class="nft-collection-card"
    >
        <div class="card-header" :style="{'background-image': `url(${imgUrl})` }">
            <div class="card-header-img">
                <img 
                    :src="imgUrl" 
                    alt=""
                />
            </div>
        </div>
        <div class="p-2 text-center flex-grow-1 d-flex align-items-center justify-content-center">
            <div class="px-2">
                <div class="fw-bold fs-12 hint font-monospace text-truncate">
                    {{ item.symbol }}
                </div>
                <div class="fw-medium item-title text-truncate-multiline text-break">
                    {{ item.name }}
                </div>
                <div class="btn mt-2 text-light item-addr border-none btn-sm rounded-pill fw-bold fs-12">
                    {{ Utils.maskAddress(item.contract)  }}
                </div>
            </div>
        </div>
    </router-link>
</template>
<style scoped>
    .item-addr {
        background: var(--bs-body-bg-dark-9);
    }
</style>