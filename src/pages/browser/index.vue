<script setup>
import { nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue';
import { WebviewEmbed } from '@botfi-app/capacitor-webview-embed/dist/esm/index.js'; 
import browserConfig from "../../config/browser"
import Utils from '../../classes/Utils';
import { App as CApp } from '@capacitor/app';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter()
const route = useRoute()
const tabs = ref({})
const activeTabId = ref(null)
const initialized = ref(false)
const isBrowserHidden = ref(false)
const addressBarRef = ref()
const toolbarRef = ref()

onMounted(() => {
    if(initialized.value) return;

    handleBrowserInit()
    handleAppEvents()

    initialized.value = true 
})


onActivated(async () => {
  
})

const hideBrowser = async () => {
    let t = getActiveTab()
    if(t != null) {
        await t.webview.hide()
    }
}

const showBrowser = async () => {
    let t = getActiveTab()
    if(t != null)  await t.webview.show()
}

const exitBrowserConfirm = async () => {
    
    await hideBrowser()

    let  confirm = await Utils.getSwal().fire({
        title: "Exit Browser",
        text: "Press 'Ok' to exit the browser",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Ok"
    })

    if(!confirm.isConfirmed){
        await showBrowser()
        return false;
    } 

    router.go("/wallet")
}

const handleAppEvents = () => {
    CApp.addListener('backButton', async () => {
        console.log("hehehehe")
        if(activeTabId == null){
            await exitBrowserConfirm()
            return false
        }   

        let t = tabs.value[activeTabId.value]

        if(!t.canGoBack){
            await exitBrowserConfirm()
            return false
        }

        t.webview.goBack()
    });

    CApp.addListener('appStateChange', ({ isActive }) => {
        if(!isActive) {
            hideBrowser()
        } else {
            if(route.path == '/browser'){
                showBrowser()
            }
        }
    });
}

const handleBrowserInit = () => {
    setTimeout(async ()=> {
        if(activeTabId.value == null){
           await newTab({ setActive: true })
           await newTab()
           await newTab()
           await newTab()
           await newTab()
        }

        initialized = true 
    }, 1000);
}

const newTab = async ({ url = browserConfig.homepage, setActive=false }) => { 

    let tabId = `wv-tab-${Utils.getUUID()}`

    if(setActive) activeTabId.value = tabId

    let webview =  new WebviewEmbed();

    tabs.value[tabId] = {
        id: tabId, 
        url, 
        hidden: setActive,
        canGoBack: false, 
        canGoForward: false,
        progress: 0 
    }


    //lets make sure the element is ready 
    let intval = window.setInterval( async () => {
        let element = document.getElementById(tabId)

        if(!element) return;

        clearInterval(intval)

        await webview.open({ url, element })

        if(!setActive) webview.hide()

        tabs.value[tabId].webview = webview
        handleWebviewEvents(tabId)

    }, 500)


    return  tabs.value[tabId]
}

const handleWebviewEvents = async (tabId) => {

    let tab = tabs.value[tabId]
    let w = tab.webview;
 
    //console.log("w====>", w)

    w.handleNavigation(async (event) => {
        
        if(!event.url) return;

        if (event.newWindow) {
            await newTab({ setActive: true, url: event.url })
        } else {
            w.loadUrl(event.url)
            tabs.value[tabId].url = event.url
        }

        event.complete(true);
    });

    w.onPageLoaded(async (e) => {
        tabs.value[tabId].canGoBack = (await w.canGoBack())
        tabs.value[tabId].canGoForward = (await w.canGoForward())
        tabs.value[tabId].progress = 0;
    })
    
    w.onProgress((p) => {
        tabs.value[tabId].progress = p.value;
    })
}


const getActiveTab = () => tabs.value[activeTabId.value]

const handleURLChange = async (newUrl) => {
    //console.log("newUrl====>",newUrl)
    await getActiveTab().webview.loadUrl(newUrl)
}

const goBack = async () => {
    let t = getActiveTab()
    if(t.canGoBack){
        await t.webview.goBack();
    }
}

const goForward = () => {
    let t = getActiveTab()
    if(t.canGoForward){
        t.webview.goForward();
    }
}

const reload = () => {
    getActiveTab().webview.reload();
}
</script>
<template>
    <WalletLayout
        title="Browser"
        :show-nav="false"
        :has-footer="false"
    >  
        <div class="browser d-flex flex-column">
            <AddressBar 
                :progress="tabs[activeTabId].progress" 
                :url="tabs[activeTabId].url"
                :totalTabs="Object.keys(tabs).length + 1"
                @urlChange="handleURLChange"
            />
          <template v-for="tabInfo in tabs" :key="tabInfo.id">
            <div 
                :id="tabInfo.id"
                :class="`tab w-100 flex-grow-1`"
                v-if="(tabInfo.id == activeTabId)"
            ></div>
            <div v-else class="tab not-active"></div>
          </template>
            <BrowserToolBar 
                @goBack="goBack"
                @goFoward="goForward"
                @reload="reload"
                :canGoBack="tabs[activeTabId].canGoBack"
                :canGoForward="tabs[activeTabId].canGoForward"
            />
        </div>
    </WalletLayout> 
</template>
<style lang="scss">
.browser {
    overflow: hidden;
    width: 100vw;
    height: 100vh;
}
.tab{
    width: 100vw;
    display: block;
    &.not-active {
        display: none;
    }
}

</style>