<script setup>
import { onMounted, ref, watch } from 'vue';
import randomColor from 'randomcolor'

const props = defineProps({
    placeholder: {type: String, default: ''},
})

const imgLoaded = ref(false)
const imgRef = ref()
const placeholderRef = ref()
const pBg = ref(randomColor({  luminosity: 'dark' }))
const pColor = ref("rgba(255,255,255,0.95)")

onMounted(() => {
    imgRef.value.classList.add("hidden")
    //console.log($attrs)
})

const onImgLoad = () => {
    imgLoaded.value = true
    imgRef.value.classList.remove("hidden")
}

const onImgLoadError = () => {
    let pRef = placeholderRef.value;
    pRef.classList.add([ "text-center"])
    pRef.style.background = pBg.value
    pRef.style.color = pColor.value
}
</script>
<template>
    <div v-bind="{
        ...$attrs,
        }" 
        v-if="($attrs.src || '') == '' || !imgLoaded" 
        ref="placeholderRef"
        :class="`${$attrs.class || ''} fw-semibold fs-14 d-flex align-items-center justify-content-center`"
        :style="{
            width: (($attrs.width) ? $attrs.width + 'px' : '100%'),
            height: (($attrs.height) ? $attrs.height + 'px' : '100%')
        }"
    >
        <div>{{ props.placeholder.charAt(0).toUpperCase() }}</div>
    </div>
    <img 
        v-bind="$attrs"
        ref="imgRef"
        @load="onImgLoad"
        @error="onImgLoadError"
    />
</template>