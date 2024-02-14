<script setup>
import { getCurrentInstance, nextTick, onBeforeMount, onMounted, ref, useAttrs, watch } from 'vue';
import randomColor from 'randomcolor'
import Utils from '../../classes/Utils';


const props = defineProps({
    placeholder: {type: String, default: ' '},
})

const attrs = useAttrs()

const hasImgError = ref(false)
const imgRef = ref()
const placeholderRef = ref()
const pBg = ref()
const pColor = ref("rgba(0,0,0, 0.85)")
const placeholderFirstChar = ref("")


onBeforeMount(() => {

    let src = (attrs.src || "").trim()

    if(src == "") {
        hasImgError.value = true
    }

    let placeholder = props.placeholder || " "
    
    let seed = (attrs.src || "").trim()

    if(seed == ''){
        seed = placeholder
    }

    pBg.value = randomColor({  
                    luminosity: 'light',
                    hue: Utils.getCssVar("bs-primary"),
                    seed  
                })

    placeholderFirstChar.value = placeholder.charAt(0).toUpperCase()
})

const onImgLoad = () => {
    hasImgError.value = false
}

const onImgLoadError = () => {
    hasImgError.value = true 
}
</script>
<template>
    <template v-if="hasImgError" :key="hasImgError">
        <div v-bind="{
            ...$attrs,
            }" 
            ref="placeholderRef"
            :class="`${$attrs.class || ''} fw-semibold fs-14 center-vh`"
            :style="{
                width: (($attrs.width) ? $attrs.width + 'px' : '100%'),
                height: (($attrs.height) ? $attrs.height + 'px' : '100%'),
                background: pBg,
                color:      pColor 
            }"
        >
            <div>{{ placeholderFirstChar }}</div>
        </div>
    </template>
    <template v-if="!hasImgError" :key="hasImgError">
        <img 
            v-bind="$attrs"
            ref="imgRef" 
            @load="onImgLoad"
            @error="onImgLoadError"
        />
    </template>
</template>