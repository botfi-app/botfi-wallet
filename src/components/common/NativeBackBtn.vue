<script setup>
import { onBeforeMount, onBeforeUnmount, inject, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const p = defineProps({
    url: { type: String, default: "" },
    text: { type: String, default: ""  },
    btnClass: { type: String, default: "" },
    hideArrow: { type: Boolean, default: false }
})

const botUtils = inject("botUtils")
const router = useRouter()
const backBtn = ref(null)
const callbackFunc = ref(null)
const route = useRoute()

onBeforeMount(() => {
    let url = p.url.trim();

    if(url == '') {
       url = route.query.r || "";

        if(url == ''){
            url = "/wallet"
        }
    }

    callbackFunc.value = () => router.push(url) 

    let _backBtn = botUtils.backBtn(callbackFunc.value)

   // console.log("_backBtn===>", _backBtn)

    if(_backBtn != null && _backBtn.isSupported()){
        
        _backBtn.enable()
        _backBtn.show()

        backBtn.value = _backBtn
    }
})

onBeforeUnmount(() => {
    if(!backBtn.value) return;
    backBtn.value.disable(true)
})
</script>
<template>
    <div v-if="backBtn == null || !backBtn.isSupported()">
       <a href="#" 
            @click.prevent="callbackFunc"
            :class="`
                rounded-pill 
                mx-0
                px-0
                ${ p.btnClass }
            `"
        >
            <div class="d-flex align-items-center d-block justify-content-center me-1">
                <Icon v-if="!p.hideArrow" name="bx:arrow-back"  class="me-2" :size="24" />
                <span v-if="p.text != ''" class="me-2">{{p.text}}</span>
            </div>
         </a> 
    </div>
</template>