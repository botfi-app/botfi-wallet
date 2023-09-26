<script setup>
import { inject, onBeforeMount, ref } from 'vue';
import Avatar from './Avatar.vue';
import Utils from "../../classes/Utils"
import Http from "../../classes/Http"

const props = defineProps({
                userId: String,
                rounded: { type: Boolean, default: true },
                size: { type: Number, default: 24 }
            })

onBeforeMount(() => {
    initialize()
})

const botUtils = inject("botUtils")
const imgSrc = ref("")
const imgRef = ref()

const initialize = async () => {
    try {

        let uri = `/${botUtils.botPlatform}/profile-photo/${botUtils.getUserInfo().id}`
        let resultStatus = await Http.getApi(uri)

        if(resultStatus.isError()){
            return  Utils.logError(`ProfilePhoto#initialize: ${resultStatus.getMessage()}`)
        }

        let imgB64Uri = resultStatus.getData() || ""
        
        if(imgB64Uri.trim() != ''){
            imgSrc.value = imgB64Uri
        }
    } catch(e){
        Utils.logError(`ProfilePhoto#initialize:`,e)
    }
}

onBeforeMount(() => {
    initialize()
})
</script>
<template>
    <div>
        <img 
            :src="imgSrc" 
            v-if="imgSrc != ''" 
            ref="imgRef" 
            :class="`shadow-lg ${props.rounded ? 'rounded-circle' : 'rounded'}`"
            :style="{ width: props.size+'px', height: props.size+'px'}" 
            @error="imgSrc=''"
        /> 
        <Avatar 
            v-else 
            :name="props.userId" 
            :size="props.size"
            variant="ring" 
            class="rounded" 
            :square="true"
        />
    </div>
</template>