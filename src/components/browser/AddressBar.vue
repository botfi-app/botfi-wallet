<script setup>
import { nextTick, onUpdated, ref, watch } from 'vue';
import Utils from '../../classes/Utils';
import NetSelectModal from '../modals/NetSelectModal.vue';
import { isURL } from 'validator'
import browser from '../../config/browser';

const p = defineProps({
    progress: { type: Number, default: 0 },
    url: { type: String, default: "" },
    totalTabs: { type: Number, default: 0 }, 
})

const clearBtn = ref()
const inputRef = ref()
const userInput = ref("")
const urlInputText = ref("")
const inputFocused = ref(false)
const progress = ref(0)
const fullUrl = ref(p.url)
const urlHost = ref("")
const isSecure = ref(false)

const emits = defineEmits(["urlChange", "openHome", "inputFocused"])

watch(p, () => {
    //console.log("p===>", p)
    progress.value = p.progress
    fullUrl.value = p.url
}, { deep: true });

watch(fullUrl, () => {
    let parsedUrl = new URL(fullUrl.value)
    urlHost.value = parsedUrl.host
    isSecure.value = (parsedUrl.protocol == 'https:')

    if(!inputFocused.value){
        urlInputText.value = urlHost.value
    }
})

watch(inputFocused, () => emits("inputFocused", inputFocused.value))

const handleOnSubmit = () => {

    let text = userInput.value.trim()

    if(!isURL(text)){
        text = `${browser.default_search}${text}`
    }

    userInput.value = ''

    inputRef.value.blur()

    emits("urlChange",  text)
}

const inputFocus = (e) => {
    let _input = inputRef.value
    inputFocused.value = true
    _input.value = fullUrl.value

    if(e.relatedTarget == clearBtn.value) return;

    nextTick(() => _input.select())
    
}

const inputBlur = (e) => {
        
    if(e.relatedTarget == clearBtn.value){
        e.target.focus()
        e.target.value = ""
        return false;
    }

    inputFocused.value = false
    urlInputText.value = urlHost.value
}

const handleUserInput = (e) => {
    userInput.value = e.target.value;
}


</script>
<template>
    <div class="w-100">
        <div id="browser-addr-bar" class="d-flex justify-content-space align-items-center px-2 py-2">
            
            <div>
                <a href="#" @click.prevent="$emit('openHome')" 
                    class="btn b-home-btn center-vh  me-2"
                >
                    <Icon name="iconamoon:home-light" :size="24" />
                </a>
            </div>
        

            <div :class="`
                addr-input-wrapper 
                w-full 
                center-vh 
                flex-grow-1
                px-3
                ${inputFocused ? 'focus': ''}`
            ">
                
                <div>
                    <Icon v-if="isSecure" class="text-success" name="uis:lock" :size="20" />
                    <Icon v-else class="text-danger" name="f7:lock-slash-fill" :size="20" />
                </div>

                <form @submit.prevent="handleOnSubmit" class="w-full">
                    <input 
                        ref="inputRef"
                        id="addr-bar-input"
                        type="text"
                        class="w-full no-border flex-grow-1"
                        style="border:none;" 
                        v-model="urlInputText"
                        @focus="inputFocus"
                        @blur="inputBlur"
                        autocapitalize="off"
                        autosave="off"
                        autocorrect="off"
                        @keydown="handleUserInput"
                    />
                </form>
                <div class="center-vh">
                    <button ref="clearBtn" class="btn btn-none rounded-circle p-0 clear-btn">
                        <Icon name="ooui:close" :size="20" />
                    </button>
                </div>
            </div>
            <div class="d-flex center-vh ms-2 menu-btns">
                <NetSelectModal />
                <a href="#" @click.prevent
                    class="btn rounded py-0  center-vh fs-14 tabs-btn"
                >
                   {{ p.totalTabs }}
                </a>
             
            </div>
        </div>
        <div  v-if="progress > 0 && progress < 1"
            class="loading-bar p-0 m-0 shadow" 
            :style="{ width: `${(progress * 100)}%` }"
        />
 
    </div>
  
</template>
<style lang="scss" scoped>
#browser-addr-bar {

    $iconH: 32px;
    $iconW: 32px;
    $itemBg: var(--bs-body-bg);
    
    background: var(--bs-body-bg-dark-5);
    height: 60px;

    .addr-input-wrapper {
        background: $itemBg;
        height: 44px;
        border-radius: 20px;
        justify-content: space-evenly;

        .clear-btn {
           display: none;
           position: relative;
           z-index: 9999;
           border: none !important;
        }

        input {
            background: none !important;
            border: none !important;
            height: 44px;
            outline: none;
            font-weight: 400;
            font-size: 15px;
            opacity: 0.85;
            letter-spacing: 0.6px;
            -webkit-outline: none;
            text-align: center;
        }

        &.focus {
            background: $itemBg;
            .input-btns { visibility: visible; }
            border: 2px solid var(--bs-primary);
            font-weight: normal;

            .clear-btn {
                display: inline-block;
            }
        }
    }
    .tabs-btn {
        height: $iconH;
        border: none !important;
        background: $itemBg !important;
    }

    .menu-btns {
        .btn {
            margin: 0px 8px;
        }
    }

   
    .b-home-btn {
        width: 44px !important;
        height: 44px !important;
        background: $itemBg !important;
        border-radius: 50%;
        padding: 0;
        opacity: 0.8;
    }
}  // end browser address bar


.loading-bar {
    width: 0%;
    height: 3px; 
    background: var(--bs-primary);  
    position: relative;
    transition: width 1s ease-in-out, visibility 1s linear;
}


</style>