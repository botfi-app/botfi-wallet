<script setup>
import { getCurrentInstance, onBeforeMount, onMounted, ref, watch } from 'vue';
import randomColor from 'randomcolor'
import Utils from '../../classes/Utils';


const props = defineProps({
    placeholder: {type: String, default: ''},
})

const imgLoaded = ref(false)
const imgRef = ref()
const placeholderRef = ref()
const pBg = ref()
const pColor = ref("rgba(0,0,0, 0.85)")
const placeholderFirstChar = ref("")


onBeforeMount(() => {
    
    let attrs = getCurrentInstance().attrs;

    let seed = (attrs.src || "").trim()
    if(seed == ''){
        seed = props.placeholder
    }

    pBg.value = randomColor({  
                luminosity: 'light',
                hue: Utils.getCssVar("bs-primary"),
                seed  
            })

    placeholderFirstChar.value = props.placeholder.charAt(0).toUpperCase()
})

const onImgLoad = () => {
    window.setTimeout(() => {
        imgLoaded.value = true
        if(imgRef.value){
            imgRef.value.classList.remove("hidden")
        }
    }, 10)
}

const onImgLoadError = () => {
    let pRef = placeholderRef.value;
    pRef.classList.add([ "text-center"])
    pRef.style.background = pBg.value
    pRef.style.color = pColor.value

    pRef.classList.remove("hidden")
    imgRef.value.classList.add("hide")
}
</script>
<template>
    <div v-bind="{
        ...$attrs,
        }" 
        v-if="($attrs.src || '') == '' || !imgLoaded" 
        ref="placeholderRef"
        :class="`${$attrs.class || ''} fw-semibold hidden fs-14 d-flex align-items-center justify-content-center`"
        :style="{
            width: (($attrs.width) ? $attrs.width + 'px' : '100%'),
            height: (($attrs.height) ? $attrs.height + 'px' : '100%')
        }"
    >
        <div>{{ placeholderFirstChar }}</div>
    </div>
    <img 
        v-bind="$attrs"
        ref="imgRef"
        @load="onImgLoad"
        @error="onImgLoadError"
    />
</template>