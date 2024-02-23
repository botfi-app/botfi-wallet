<route>
    { name: "browser" }
</route>

<script>
  export default {
    name: 'browser'
  }
</script>

<script setup>
import { nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue';
import { WebviewEmbed } from '@botfi-app/capacitor-webview-embed';  
import browserConfig from "../../config/browser"
import Utils from '../../classes/Utils';
import { App as CApp } from '@capacitor/app';
import { useRouter, useRoute } from 'vue-router';
import { useWalletStore } from '../../store/walletStore';
import { useBrowser } from "../../composables/useBrowser"
import { usePermission } from '../../composables/usePermission';
import EventBus from '../../classes/EventBus';
import { useNetworks } from '../../composables/useNetworks';

const netCore = useNetworks()
const { activeNetwork } = netCore

const walletStore = useWalletStore()
const { activeWallet } = walletStore

const browserCore = useBrowser()

const router = useRouter()
const route = useRoute()
const tabs = ref({})
const activeTabId = ref(null)
const initialized = ref(false)
const isBrowserHidden = ref(false)
const urlInputFocused = ref(false)
const { connectedSites } = usePermission();
const permissionModalRef = ref()

onMounted(() => {
    if(initialized.value) return;

    handleBrowserInit()
    handleAppEvents()

    initialized.value = true 

    //console.log("connectedSites===>", connectedSites)
})


onActivated(async () => {

    if(isBrowserHidden.value){
        showBrowser()
    }

    EventBus.on("hideBrowser", (hide) => {
        if(hide)  hideBrowser()
        else  showBrowser()
    })

    EventBus.on("chainChanged", (netInfo)=>{
        emitWeb3Events("chainChanged", "0x"+netInfo.chainId.toString(16))
    })

    EventBus.on("accountsChanged", (account)=>{
        emitWeb3Events("accountsChanged", [account])
    })
})

onDeactivated(() => {
    EventBus.on("hideBrowser")
    EventBus.off("chainChanged")
    EventBus.off("accountsChanged")
    hideBrowser()
})


const hideBrowser = async () => {
    isBrowserHidden.value = true
    let tab = getActiveTab()
    if(tab != null) await tab.webview.hide()
}

const showBrowser = async () => {
    isBrowserHidden.value = false
    let tab = getActiveTab()
    if(tab != null) await tab.webview.show()
}

const handleAppEvents = () => {
    CApp.addListener('backButton', async () => {

        if(isBrowserHidden.value) return;

        if(urlInputFocused.value){
            document.getElementById("addr-bar-input").blur()
            return false
        }
        
        if(activeTabId.value == null){
            return false
        }   

        let t = tabs.value[activeTabId.value]

        if(!t.canGoBack){
            return false
        }

        t.webview.goBack()
    });

    CApp.addListener('appStateChange', async ({ isActive }) => {
       if(!walletStore.isLoggedIn() || route.path != '/browser'){
            hideBrowser()   
            router.go("/wallet")   
       }
    });
}

const handleBrowserInit = () => {
    setTimeout(async ()=> {
        if(activeTabId.value == null){
           await newTab({ setActive: true })
        }

        initialized.value = true 
    }, 1000);
}

const newTab = async ({ url = browserConfig.homepage, setActive=false }) => { 

    let tabId = Utils.getUUID()

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

    let injectScript = browserCore.getInjectScript(tabId)
    
    //console.log("jsToInject===>", jsToInject)

    //lets make sure the element is ready 
    let intval = window.setInterval( async () => {
        let element = document.getElementById(tabId)

        if(!element) return;

        clearInterval(intval)

        await webview.open({ 
            url, 
            element,  
            script: {
                javascript: injectScript,
                injectionTime: 0
            },
            webMessageJsObjectName: "botfi_msg_channel"
        })

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
        
        //consolelog("event===>", event)
        if(!('url'  in event)) return;

        if (event.newWindow) {
            await newTab({ setActive: true, url: event.url })
        } else {
            w.loadUrl(event.url)
            tabs.value[tabId].url = event.url
        }

        event.complete(true);
    });

    w.onPageLoaded(async (dataObj) => {
        
        let { url = ''} = dataObj

        tabs.value[tabId].canGoBack = (await w.canGoBack())
        tabs.value[tabId].canGoForward = (await w.canGoForward())
        tabs.value[tabId].progress = 0;
        
        if(url.trim() != '') {
            tabs.value[tabId].url = url
        }

    })
    
    w.onProgress((p) => {
        tabs.value[tabId].progress = p.value;
    })

    w.onMessage(async (dataObj) => {
        browserCore.processWebMessage({
            webview: w, 
            dataObj,
            permissionModal: permissionModalRef
        });
    });

}


const getActiveTab = () => tabs.value[activeTabId.value]

const handleURLChange = async (newUrl) => {
    //console.log("newUrl====>",newUrl)
     getActiveTab().webview.loadUrl(newUrl)
}

const openHome = async () => {
    getActiveTab().webview.loadUrl(browserConfig.homepage)
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


const emitWeb3Events = async (eventName, value) => {
    let _tabs = tabs.value
    Object.keys(_tabs).forEach((tabId) => {
        let t = _tabs[tabId]
        if(t.webview){
            browserCore.emitWeb3Event(t.webview, eventName, value)
        }
    })
}
</script>
<template>
    <WalletLayout
        title="Browser"
        :show-nav="false"
        :has-footer="false"
    >  
        <div class="browser">
            <AddressBar 
                :progress="tabs[activeTabId].progress" 
                :url="tabs[activeTabId].url"
                :totalTabs="Object.keys(tabs).length"
                @urlChange="handleURLChange"
                @openHome="openHome"
                @inputFocused="(v) => urlInputFocused = v"
            />
          <template v-for="tabInfo in tabs" :key="tabInfo.id">
            <div 
                :id="tabInfo.id"
                :class="`tab w-100 flex-grow-1 ${isBrowserHidden ? 'b-hidden': ''}`"
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

        <PermissionModal 
            @show="hideBrowser"
            @hide="showBrowser"
            ref="permissionModalRef"
        />
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
    height: calc(100vh - 120px) !important;
    &.not-active {
        display: none;
    }

    &.b-hidden { visibility: hidden; }
}

</style>