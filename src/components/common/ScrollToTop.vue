<script setup>
import { ref, onBeforeUnmount, onMounted } from 'vue';

const p = defineProps({
             scrollElement: { type: String, default: "body"}
          })

const scrollContainer = ref()
const btnRef = ref()

onMounted(()=>{

    scrollContainer.value = document.querySelector(p.scrollElement)

    if(!scrollContainer.value) return;

    let sc = scrollContainer.value
        
    let btn = btnRef.value 
    let btnClass = btn.classList;

    // display the button when user scrolls more than 20px
    sc.addEventListener("scroll", () => {
        if (sc.scrollTop > 50) {
            btnClass.remove("hidden")
        } else {
           btnClass.add("hidden")
        }
    })
})

const handleBtnClick = () => {
    if(!scrollContainer.value) return;
    scrollContainer.value.scrollTo({top: 0, behavior: 'smooth'});
}

onBeforeUnmount(()=>{
    if(!scrollContainer.value) return;
    scrollContainer.value.removeEventListener('scroll', ()=>{})
})
</script>
<template>
    <div  ref="btnRef"
        class="hidden btn-top center-vh shadow-lg m-pointer no-select"
        @click="handleBtnClick"
    >
        <Icon name="mdi:arrow-up" />
    </div>
</template>
<style scoped>
.btn-top {
    position: fixed;
    right: 25px;
    bottom:  20px;
    width: 32px;
    height: 32px;
    z-index: 110;
    overflow: hidden;
    background: var(--bs-primary);
    border-radius: 50%;
}
</style>