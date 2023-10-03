<script setup>

    import { onBeforeMount, ref, onBeforeUnmount, onMounted, nextTick } from "vue"
    import * as jlottie from '@lottiefiles/jlottie';

    const props = defineProps({
        name:       { type: String, required: true },
        width:      { type: Number, default: 250 },
        height:     { type: Number, default: 250 },
        autoplay:   { type: Number, default: 1 },
        loop:       { type: Number, default: 1 }
    })

    const lottieId = ref("lottie_"+Date.now())
    const player = ref()

    onMounted(()=>{

        let uri = `/lottie/${props.name}.json`

        nextTick(()=> {
            jlottie.loadAnimation({
                container: player.value,
                loop: true,
                autoplay: true,
                useWebWorker: false,
                path: uri,
            });
        }) 
    })

    onBeforeUnmount(()=> {
        if(player.value){
            jlottie.stop(lottieId.value)
            jlottie.destroy(lottieId.value)
        }
    })
</script>
<template>
    <div :id="lottieId" class="lottie-player" ref="player"></div>
</template>
<style scoped>
    .lottie-player {
        width: 200px !important;
        height: 200px !important;
        max-width: 100%;
        max-height: auto !important;
    }
</style>