<script setup>
import { nextTick, onMounted, onUpdated, ref, watch } from 'vue';
import Utils from '../../classes/Utils';
import NetSelectModal from '../modals/NetSelectModal.vue';
import { isURL } from 'validator'
import browser from '../../config/browser';
import EventBus from '../../classes/EventBus';
import HistoryItems from './HistoryItems.vue';
//import { useBrowserHistory } from '../../composables/useBrowserHistory';
import SearchSuggest from './SearchSuggest.vue';

const p = defineProps({
    progress: { type: Number, default: 0 },
    url: { type: String, default: "" }, 
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
const showSuggestionBox = ref(false)
const editMode = ref(false)

const emits = defineEmits([
        "urlChange", 
        "openHome", 
        "inputFocused", 
        "reload",
        "suggestBoxShow"
])

onMounted(() => {
    processUrl()
})

const hideBrowser = (opt) => EventBus.emit("hideBrowser", opt)

watch(p, () => {
    //console.log("p===>", p)
    progress.value = p.progress
    fullUrl.value = p.url
}, { deep: true });

watch(fullUrl, () => processUrl())

const processUrl = () => {

    let parsedUrl = new URL(fullUrl.value)
    urlHost.value = parsedUrl.host
    isSecure.value = (parsedUrl.protocol == 'https:')

    if(!inputFocused.value){
        inputRef.value.value = urlHost.value
    }
}

watch(inputFocused, () => {
    emits("inputFocused", inputFocused.value)
    if(inputFocused.value){
        hideBrowser(true)
    }
})

watch(showSuggestionBox, () => {
    if(!showSuggestionBox.value){
        hideBrowser(false)
        userInput.value = ""
    }
})

const handleOnSubmit = () => {

    let input = inputRef.value
    let value = input.value;

    if(value != "") {
    
        if(!isURL(value)){
            value = browser.defaultSearch.replace("{{KEYWORD}}", value)

            //update to the search url 
            input.value = value
        }

        emits("urlChange",  value)
    }

    showSuggestionBox.value = false
    inputRef.value.blur()

}

const inputFocus = (e) => {
    let _input = inputRef.value
    inputFocused.value = true
    
    // if the suggestion box isnt showing,
    if(!editMode.value){
        _input.value = ""
    }

    if(e.relatedTarget == clearBtn.value) return;
    
    //nextTick(() => _input.select())
    showSuggestionBox.value = true
}

const inputBlur = (e) => {
        
    if(e.relatedTarget == clearBtn.value){
        e.target.focus()
        e.target.value = ""
        return false;
    }

    let t = e.target;
    inputFocused.value = false
    
    //console.log("e.value.trim()===>", t.value.trim())

    if(!showSuggestionBox.value || t.value.trim() == ""){
        t.value = urlHost.value
    }

}

const handleUserInput = (e) => {
    nextTick(() => {
        userInput.value = e.target.value;
    })
}

const onHistoryItemSelect = (url) => {
    emits("urlChange",  url)
    showSuggestionBox.value = false
}

const editURL = () => {

    editMode.value = true 
    
    let input = inputRef.value
    input.value = fullUrl.value
    
    setTimeout(() => {
        input.focus()
        nextTick(() => editMode.value = false )
    }, 200)
}

const  copyURL = () => {
    Utils.copyText({ text: fullUrl.value, showToast: true, successText: "URL Copied" })
}

/*
const shareURL = async () => {
    await window.navigator.share({
        url: fullUrl.value,
        title: 'Open with',
        text: ""
    });
}*/

const close = () => {
    showSuggestionBox.value = false
    nextTick(()=> {
        inputRef.value.blur()
    })
}

const searchByKeyword = (word) => {
    inputRef.value.value = word
    handleOnSubmit()
}

defineExpose({inputFocused, showSuggestionBox, close});
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
                        @focus="inputFocus"
                        @blur="inputBlur"
                        autocapitalize="off"
                        autosave="off"
                        autocorrect="off"
                        @keyup="handleUserInput"
                    />
                </form>
                <div class="center-vh">
                    <button ref="clearBtn" class="btn btn-none rounded-circle p-0 clear-btn">
                        <Icon name="eva:arrow-forward-outline"  />
                    </button>
                    <a  href="#" @click.prevent="emits('reload')"
                        class="btn btn-none p-0 reload-btn"
                    >
                        <Icon name="radix-icons:reload"  :size="20" />
                    </a>
                </div>
            </div>
            <div class="d-flex center-vh ms-2 menu-btns">
                <NetSelectModal />
                <router-link 
                    to="/browser/menu"
                    class="py-0  px-1 center-vh ms-1"
                >
                    <Icon name="iconamoon:menu-kebab-vertical" class="icon"  />
                </router-link>
            </div>
        </div>
        <div  v-if="progress > 0 && progress < 1"
            class="loading-bar p-0 m-0 shadow" 
            :style="{ width: `${(progress * 100)}%` }"
        />
        <div v-if="showSuggestionBox" class="history-suggest-box">
            <div class="addr-info d-flex mb-3 center-vh ps-3 px-2">
                <div class="text-truncate fs-14 fw-middle text-muted">
                    {{ fullUrl }}
                </div>
                <div class="d-flex mx-1">
                    <button @click.prevent="copyURL"
                        class="btn btn-icon bg-darken-5 rounded-circle shadow mx-1 text-warning"
                    >
                        <Icon name="solar:copy-bold-duotone" />
                    </button>
                    <button @click.prevent="editURL"
                        class="btn btn-icon bg-darken-5 rounded-circle shadow mx-1 text-primary"
                    >
                        <Icon name="lets-icons:edit-duotone" />
                    </button>
                    <!--
                    <button @click.prevent="shareURL"
                        class="btn btn-icon bg-darken-5 rounded-circle shadow mx-1 text-info"
                    >
                        <Icon name="icon-park-twotone:share-one" />
                    </button>
                    -->
                    <button @click.prevent="close"
                        class="btn btn-icon bg-darken-5 rounded-circle shadow mx-1 text-danger"
                    >
                        <Icon name="mdi:close" />
                    </button>
                </div>
            </div>
            <div style="margin-top: 80px;">
                <div>
                    <SearchSuggest 
                        :keyword="userInput" 
                        @select="searchByKeyword"
                    />
                </div>
                <div>
                    <h5 class="px-2">History</h5>
                    <HistoryItems 
                        :limit="10" 
                        @select="onHistoryItemSelect"
                    />
                </div>
            </div>
        </div>
    </div>
  
</template>
<style lang="scss" scoped>
#browser-addr-bar {

    $iconH: 32px;
    $iconW: 32px;
    $itemBg: var(--bs-body-bg);
    
    background: var(--bs-body-bg-dark-5);
    height: 60px;
    z-index: 5px;

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

            .reload-btn {
                display: none;
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
    top: -3px;
    transition: width 1s ease-in-out, visibility 1s linear;
}

.addr-info {
    background: var(--bs-body-bg-dark-2);
    width: 100%;
    height: 60px;
    position: fixed !important;
    top: 60px;
    z-index: 10;
}

.history-suggest-box {
    height: 100vh !important;
    overflow-y: scroll !important;
    padding-bottom: 150px !important;
    display: block !important;
    position: relative;
    z-index: 0 !important;
}
</style>