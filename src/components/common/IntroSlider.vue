<script setup>
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue';

// Import Swiper styles
import 'swiper/css';
import introData from '../../config/intro_slider'

</script>
<template>
    <swiper
      :slides-per-view="1"
      :space-between="0"
      :navigation="true"
    >
        <swiper-slide 
            v-for="item in introData" 
            :style="{'backgroundColor': item.bg}"
        > 
            <div class="d-flex flex-column pt-5">
                <Icon 
                    :name="item.icon" 
                    :style="{'color': item.iconColor, width: '80vw', maxWidth: '400px', height: 'auto'}" 
                />
                <div class="p-2 text-center">
                    <h1 class="fw-bold">{{ item.title }}</h1>
                    <p>{{ item.text }}</p>
                </div>
                <div class="controls d-flex justify-content-between align-items-center">
                    <a href="#" class="btn btn-none text-uppercase fw-medium">Skip</a>
                    <a href="#" class="btn btn-none text-uppercase center-vh fw-medium">
                        <span>Next</span> 
                        <Icon name="pajamas:chevron-lg-right" />
                    </a>
                </div>
            </div>
        </swiper-slide>
    </swiper>
</template>
<style lang="scss">
    .swiper {
        overflow: 'hidden';
    }
    .swiper-slide {
    
        height: 100vh;
        overflow: 'hidden' !important;

        >div {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content:space-between;
            overflow: 'hidden' !important;
        }

        h1 {
            color: rgba(255,255,255, .65) !important;
        }
    }

    .controls {
        width: 100%;
       a{ color: rgba(255,255,255, 0.8) !important; }
        height: 50px;
        background:  rgba(0,0,0, 0.05);
    }
    
</style>