<script setup>
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue';
import { useSimpleDB } from '../../composables/useSimpleDB'
// Import Swiper styles
import 'swiper/css';
import introData from '../../config/intro_slider'
import { onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import { StatusBar } from '@capacitor/status-bar';

const db = useSimpleDB()
const curSlide = ref(0)
const swiperInst = ref(null)
const emit = defineEmits(["finish"])

onMounted(async ()=> {
   await StatusBar.setOverlaysWebView({ overlay: true });
})

onBeforeUnmount(async () => {
    await StatusBar.setOverlaysWebView({ overlay: false });
})


const onSlideChange = (i) => {
    //console.log(i)
    curSlide.value = i.activeIndex
}

const onSwiper = (v) => swiperInst.value = v

const nextSlide = () => {
    if(curSlide.value >= (introData.length - 1)){
        setFinished()
        return;
    }
    swiperInst.value.slideNext()
}

const setFinished = async () => {
    await db.setItem("__skip_intro", true)
    emit("finish")
}
</script>
<template>
    <swiper
      :slides-per-view="1"
      :space-between="0"
      :navigation="false"
      @swiper="onSwiper"
      @slide-change="onSlideChange"
    >
        <swiper-slide 
            v-for="item in introData" 
            :style="{'backgroundColor': item.bg}"
        > 
            <div class="d-flex flex-column">
                <Icon 
                    :name="item.icon" 
                    :style="{'color': item.iconColor, width: '80vw', maxWidth: '400px', height: 'auto'}" 
                />
                <div class="p-2 text-center">
                    <h1 class="fw-bold">{{ item.title }}</h1>
                    <p>{{ item.text }}</p>
                </div>
            </div>
        </swiper-slide>
    </swiper>
    <div class="controls d-flex justify-content-between align-items-center">
        <a href="#" 
            class="btn btn-none text-uppercase"
            @click.prevent="setFinished"
        >Skip</a>
        <a href="#" 
            @click.prevent="nextSlide" 
            class="btn btn-none text-uppercase center-vh"
        >
            <span>{{ (curSlide < introData.length - 1) ? "Next" : "Finish" }}</span> 
            <Icon name="pajamas:chevron-lg-right" />
        </a>
    </div>
</template>
<style lang="scss">
    .swiper {
        overflow: 'hidden';
        padding-top: -20px;
    }
    .swiper-slide {
    
        height: 100vh;
        overflow: 'hidden' !important;

        >div {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content:space-around;
            overflow: 'hidden' !important;
        }

        h1 {
            color: rgba(255,255,255, .65) !important;
        }

        h1, p { user-select: none; }
    }

    .controls {
        width: 100%;
       a, a:visited { color: rgba(255,255,255, 0.8) !important; border:none !important; }
        height: 50px;
        background:  rgba(0,0,0, 0.05);
        position: fixed;
        z-index: 100;
        bottom: 0;
    }
    
</style>