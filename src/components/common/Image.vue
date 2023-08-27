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
    let pRef = placeholderRef.value;

    pRef.classList.add([ "text-center"])
    pRef.style.background = pBg.value
    pRef.style.color = pColor.value

    //console.log($attrs)
})

const onImgLoad = () => {
    imgLoaded.value = true
    imgRef.value.classList.remove("hidden")
}

</script>
<template>
    <div v-bind="{
        ...$attrs,
        }" 
        v-if="!imgLoaded" 
        ref="placeholderRef"
    >
        {{ props.placeholder.toUpperCase() }}
    </div>
    <img 
        v-bind="$attrs"
        ref="imgRef"
        @load="onImgLoad"
    />
</template>