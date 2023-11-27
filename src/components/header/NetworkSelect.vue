<script setup>
import { useNetworks } from '../../composables/useNetworks';
import Image from '../common/Image.vue';
import Utils from '../../classes/Utils'
import { useRouter } from 'vue-router'
import { onBeforeMount, ref } from 'vue';

const props = defineProps({
    disabled: { type: Boolean, default: false },
    maxWidth: { type: String, default: '55vw'},
    backUrl: { type: String, default: "" }
})

const { isNetReady, activeNetwork } = useNetworks()
const router  = useRouter()
const backUrl = ref("") 

onBeforeMount(() => {    
    backUrl.value = (props.backUrl.trim() == "")
        ? Utils.getUriPath()
        : props.backUrl

})
</script>
<template>
    <router-link v-if="isNetReady" 
        class="btn net-select-btn px-2 rounded-pill my-2 text-truncate"
        :style="`max-width: ${props.maxWidth};`"
        :disabled="props.disabled"
        :to="`/networks?r=${backUrl}`"
    >
        <div class="d-flex align-items-center justify-content-center flex-nowrap">
            <Image 
                :width="24" 
                :height="24" 
                class="rounded-circle shadow"
                :src="activeNetwork.icon" 
                :placeholder="activeNetwork.name"
            />
            <div class="ms-2 me-2 a text-truncate fs-6">
                {{ activeNetwork.name }}
            </div>
            <div>
                <Icon name="charm:chevron-down" :size="20" />
            </div>
        </div>
    </router-link>
</template>