<route>
    { name: "browser" }
</route>

<script>
  export default {
    name: 'browser'
  }
</script>

<script setup>
import {  onActivated, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {WebviewEmbed as webview} from '../../../../../capacitorjs/capacitor-webview-overlay';  
import browserConfig from "../../config/browser"
import Utils from '../../classes/Utils';
import { App as CApp } from '@capacitor/app';
import { useRouter, useRoute } from 'vue-router';
import { useWalletStore } from '../../store/walletStore';
import { useBrowser } from "../../composables/useBrowser"
import { usePermission } from '../../composables/usePermission';
import EventBus from '../../classes/EventBus';
import { useNetworks } from '../../composables/useNetworks';
import { useBrowserTabs } from '../../composables/useBrowserTabs';

const netCore = useNetworks()
const { activeNetwork } = netCore

const walletStore = useWalletStore()
const { activeWallet } = walletStore

const browserCore = useBrowser()
const browserTabs = useBrowserTabs()

const router = useRouter()
const route = useRoute()
const tabs = ref({})
const activeTabId = ref(null)
const initialized = ref(false)
const isBrowserHidden = ref(false)
const urlInputFocused = ref(false)
const { connectedSites } = usePermission();
const permissionModalRef = ref()

onBeforeMount(() => {

    if(initialized.value) return;

    handleBrowserInit()
    handleAppEvents()
    initBrowserEvents()
    initializeWebviewEvents()

    initialized.value = true 
})

watch(tabs, () => {
    EventBus.emit("tabsUpdated", tabs.value)
})

const initBrowserEvents = () => {

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

    EventBus.on("onWebpageInfoUpdate", (info) => handleWebpageInfoUpdate(info))

    EventBus.on("switchBrowserTab", (tabId) => switchTab(tabId))

    EventBus.on("newBrowserTab", () => newTab({ setActive: true }))

    EventBus.on("closeBrowserTab", (tabId) => closeBrowserTab(tabId) )
}

onActivated(async () => {

    if(isBrowserHidden.value){
        showBrowser()
    }

    window.getBrowserTabs = () => {
        return tabs.value
    }
})

onBeforeUnmount(() => {
    
    EventBus.off("hideBrowser")
    EventBus.off("chainChanged")
    EventBus.off("accountsChanged")
    EventBus.off("switchBrowserTab")
    EventBus.off("onWebpageInfoUpdate")
    EventBus.off("newBrowserTab");

    hideBrowser()

    webview.removeAllEvents()
})


const hideBrowser = async () => {
    isBrowserHidden.value = true
    let tab = getActiveTab()
    if(tab != null) await webview.hide(tab.id)
}

const showBrowser = async () => {
    isBrowserHidden.value = false
    let tab = getActiveTab()
    if(tab != null) await webview.show(tab.id)
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

        webview.goBack()
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

/*
watch(activeTabId, () => {
    let ts = tabs.value
    Object.keys(ts).forEach(tabId => {
        let hidden = (tabId == activeTabId.value) ? false : true 
        tabs.value[tabId].hidden = hidden 
    })
})
*/

const newTab = async ({ url = browserConfig.homepage, setActive=false }) => { 

    let tabId = Utils.getUUID()

    //let webview =  new WebviewEmbed();

    tabs.value[tabId] = {
        id: tabId, 
        url, 
        title: "",
        hidden: setActive,
        canGoBack: false, 
        canGoForward: false,
        progress: 0 
    }

    if(setActive) activeTabId.value = tabId

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
            webviewId: tabId,
            script: {
                javascript: injectScript,
                injectionTime: 0
            },
            webMessageJsObjectName: "botfi_msg_channel"
        })


    }, 500)


    return  tabs.value[tabId]
}

const switchTab = (tabId) => {
    
    let tab = tabs.value[tabId] || null
    
    if(!tab) return;

    webview.setActiveWebview(tabId)

    // lets get current tab and hide it 
    activeTabId.value = tabId
}

const closeBrowserTab = async (tabId) => {
    
    let { result: nextActiveTab } = await webview.close(tabId)
    delete tabs.value[tabId]

    activeTabId.value = (nextActiveTab != "") ? nextActiveTab : null
}

const handleWebpageInfoUpdate = (info={}) => {
    let tabId = (info.tabId || "").toString().trim()
    let webpageTitle = (info.title || "").toString().trim()

    if(tabId == "" || !(tabId in tabs.value)) return;

    tabs.value[tabId].title = webpageTitle
}

const initializeWebviewEvents = async () => {

    webview.handleNavigation(async (event) => {
        
        let url = (event.url || "").trim()
        let tabId = event.webviewId

        console.log("event===>", event)
        if(url == "") return;

        if(!/^(https?:\/\/)/.test(url)){
            window.location = url
            event.complete(true);
            return false; 
        }

        if (event.newWindow) {
            await newTab({ setActive: true, url })
        } else {
            webview.loadUrl(tabId, event.url)
            tabs.value[tabId].url = url
        }

        browserTabs.saveTabs(tabs)

        event.complete(true);
    });
    
    webview.onPageLoaded(async (dataObj) => {

        console.log("dataObj===>", dataObj)
        
        let { url = ''} = dataObj
        let tabId = dataObj.webviewId;

        tabs.value[tabId].canGoBack = (await webview.canGoBack(tabId))
        tabs.value[tabId].canGoForward = (await webview.canGoForward(tabId))
        tabs.value[tabId].progress = 0;
        
        if(url.trim() != '') {
            tabs.value[tabId].url = url
        }

    })
    
    webview.onProgress(({ webviewId, value }) => {
        if(webviewId in tabs.value){
            tabs.value[webviewId].progress = value;
        }
    })

    webview.onMessage(async (dataObj) => {
        browserCore.processWebMessage({
            webview, 
            dataObj,
            permissionModal: permissionModalRef
        });
    });
    
}


const getActiveTab = () => tabs.value[activeTabId.value]

const handleURLChange = async (newUrl) => {
    console.log("newUrl====>",newUrl)
    console.log("getActiveTab()===>>>", getActiveTab())
    webview.loadUrl(activeTabId.value, newUrl)
}

const openHome = async () => {
    webview.loadUrl(activeTabId.value,browserConfig.homepage)
}

const goBack = async () => {
    let t = getActiveTab()
    if(t.canGoBack){
        webview.goBack(t.id);
    }
}

const goForward = () => {
    let t = getActiveTab()
    if(t.canGoForward){
        webview.goForward(t.id);
    }
}

const reload = () => {
    webview.reload(activeTabId.value);
}


const emitWeb3Events = async (eventName, value) => {
    let _tabs = tabs.value
    Object.keys(_tabs).forEach((tabId) => {
        let t = _tabs[tabId]
        if(webview){
            //browserCore.emitWeb3Event(t.webview, eventName, value)
        }
    })
}

const isActiveTab = (tabId) => tabId == activeTabId.value
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
                @reload="reload"
                @urlChange="handleURLChange"
                @openHome="openHome"
                @inputFocused="(v) => urlInputFocused = v"
                :key="activeTabId"
            />
          <template v-for="tabInfo in tabs" :key="tabInfo.id">
            <div>
                <div 
                    :id="tabInfo.id"
                    :class="'tab '+
                        `${ isBrowserHidden  ? 'b-hidden': ''} `+
                        `${ tabInfo.id != activeTabId ? 'not-active' : ''}`
                    "  
                />
            </div>
          </template>
            <div class="browser-footer">
                <BrowserToolBar 
                    @goBack="goBack"
                    @goFoward="goForward"
                    :totalTabs="Object.keys(tabs).length"
                    :canGoBack="tabs[activeTabId].canGoBack"
                    :canGoForward="tabs[activeTabId].canGoForward"
                />
            </div>
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
    height: calc(100vh - 120px);
    z-index: 10;
    position: absolute;
    top: 60px;
    left: 0px;
    display: block;

    &.not-active {
        display: none !important; 
        z-index: 0;
    }

    &.b-hidden { 
        display: none;
    }
}

.browser-footer{
    position: absolute;
    bottom: 0px;
    width: 100vw;
}

</style>