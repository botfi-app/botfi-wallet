<route>
    { name: "browser" }
</route>

<script>
  export default {
    name: 'browser'
  }
</script>

<script setup>
import {  nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue';
import {WebviewEmbed as webviewPlugin } from '../../../../../capacitorjs/capacitor-webview-overlay';  
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
import { Share } from '@capacitor/share';

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
const addrBarRef = ref(null)

onMounted(() => {

    if(initialized.value) return;

    handleAppEvents()
    initBrowserEvents()
    initializeWebviewEvents()

    openSavedTabs()

    showBrowser()

    window.addEventListener("resize", () => {
        nextTick(() => refreshDimensions())
    })

    initialized.value = true 
})


watch(tabs, () => {
   // console.log("watch#tabs===>", tabs.value)
    browserTabs.saveTabs(tabs)
    EventBus.emit("tabsUpdated", tabs.value)
}, { deep: true })

watch(activeTabId, () => {
    nextTick(() => refreshDimensions())
})

const openSavedTabs = async () => {

    let savedTabsData = await browserTabs.getTabs()
    let savedTabs = savedTabsData.tabs || {}
    let savedActiveTabId = savedTabsData.activeTab || ""

    let itemKeys = Object.keys(savedTabs)

    if(itemKeys.length > 0){
        if( savedActiveTabId == "") savedActiveTabId = itemKeys[0]
        
        for(let tabId of itemKeys){
            let setActive = (savedActiveTabId == tabId)
            newTab({ tabId, url: savedTabs[tabId].url, setActive })
        }
    } else {
        newTab({  setActive: true })
    }
}

const initBrowserEvents = () => {

    EventBus.on("hideBrowser", (hide) => {
        if(hide) {
            hideBrowser();  
        } else { 
            showBrowser();
        } 
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
   showBrowser()
})

onDeactivated(()=>{
   hideBrowser()
})

onBeforeUnmount(() => {
    
    EventBus.off("hideBrowser")
    EventBus.off("chainChanged")
    EventBus.off("accountsChanged")
    EventBus.off("switchBrowserTab")
    EventBus.off("onWebpageInfoUpdate")
    EventBus.off("newBrowserTab");

    hideBrowser()

    webviewPlugin.removeAllEvents()
})


const hideBrowser = async () => {
    isBrowserHidden.value = true
    let tab = getActiveTab()
    if(tab != null) {
        await webviewPlugin.updateDimensions({ 
            webviewId: tab.id, width: 0, height: 0, x: 0, y: 0 
        });
        await webviewPlugin.hide(tab.id)
    }
}

const showBrowser = async () => {
    isBrowserHidden.value = false
    let tab = getActiveTab()
    if(tab != null) {
        await webviewPlugin.show(tab.id)
        refreshDimensions()
    }
}

const refreshDimensions = () => {
    setTimeout(() => {

        //addr bar height
        let addrBarH = 60
        let bottomToolbarH = 60
        
        let height =  Math.ceil(window.innerHeight - (addrBarH + bottomToolbarH))

        webviewPlugin.updateDimensions({
            webviewId: activeTabId.value,
            width: Math.ceil(window.innerWidth),
            height,
            x: 0,
            y: addrBarH
        });

    }, 200)
}

const handleAppEvents = () => {
    CApp.addListener('backButton', async () => {
        
        let _activeTabId = activeTabId.value
        let _addrBarRef = addrBarRef.value

        if(_addrBarRef){

            if(urlInputFocused.value){
                document.getElementById("addr-bar-input").blur()
                return false
            }

            if(_addrBarRef.showSuggestionBox){
                _addrBarRef.close()
                return false;
            }
        }

        // process the data above first cos when the addr bar is focused, the browser 
        // is hidden
        if(isBrowserHidden.value) return;
 
        if(activeTabId.value == null){
            return false
        }   

        let t = tabs.value[_activeTabId]

        if(!t.canGoBack){
            return false
        }

        webviewPlugin.goBack(_activeTabId)
    });

    CApp.addListener('appStateChange', async ({ isActive }) => {
       if(!walletStore.isLoggedIn() || route.path != '/browser'){
            hideBrowser()   
            router.go("/wallet")   
       }
    });
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

const newTab = async ({ 
    tabId = Utils.getUUID(),
    url = browserConfig.homepage,
    setActive = false 
}) => { 

    tabs.value[tabId] = {
        id: tabId, 
        url, 
        title: "",
        webviewCreated: setActive,
        canGoBack: false, 
        canGoForward: false,
        progress: 0 
    }

    if(setActive) {
        
        activeTabId.value = tabId

        let injectScript = browserCore.getInjectScript(tabId)
        
        //lets make sure the element is ready 
        let intval = window.setInterval( async () => {
            let element = document.getElementById(tabId)

            if(!element) return;

            clearInterval(intval)

            await webviewPlugin.open({ 
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
    }

    return  tabs.value[tabId]
}

const switchTab = async (tabId) => {
    
    let tab = tabs.value[tabId] || null
    
    if(!tab) return;

    if(!tab.webviewCreated){
        // lets recreate the tab but this time creating the webview item
        await newTab({ tabId, url: tab.url, setActive: true })

    } else {
        await webviewPlugin.setActiveWebview(tabId)
        
        // lets get current tab and hide it 
        activeTabId.value = tabId
    }
}

const closeBrowserTab = async (tabId) => {

    try {
   
        let tabsKeysArr = Object.keys(tabs.value);

        // if last tab, open home
        if(tabsKeysArr.length == 1){

            // if not initialzied do initialize it 
            if(!tabs.value[tabId].webviewCreated){
                return newTab({ tabId, url: browserConfig.homepage, setActive: true })
            } else {
                return openHome()
            }
        }

        //if the active tab is what we are closing, lets now switch it first 
        if(tabId === activeTabId.value){
            
            // lets check the tab Index 
            let tabKeyIdx = tabsKeysArr.indexOf(tabId)

            if(tabKeyIdx == -1) return;

            let nextTabIdx = (tabKeyIdx == 0) ? 1 :tabKeyIdx - 1;

            let nextTabId = tabsKeysArr[nextTabIdx]

            await switchTab(nextTabId)

            //console.log("nextTabId===>", nextTabId)
        }
        
        delete tabs.value[tabId]
        
        if(tabs.value[tabId].webviewCreated){
            await webviewPlugin.close(tabId)
        }

    } catch(e){
        Utils.logError("browser#closeBrowserTab:", e)
    }
}

const handleWebpageInfoUpdate = (info={}) => {
    let tabId = (info.tabId || "").toString().trim()
    let webpageTitle = (info.title || "").toString().trim()

    if(tabId == "" || !(tabId in tabs.value)) return;

    tabs.value[tabId].title = webpageTitle
}

const initializeWebviewEvents = async () => {

    webviewPlugin.handleNavigation(async (event) => {
        
        let url = (event.url || "").trim()
        let tabId = event.webviewId

        //console.log("event===>", event)

        if(url == "") return;

        if(!/^(https?:\/\/)/i.test(url)){
            await Share.share({
                url: url,
                dialogTitle: 'Open with',
            });
            event.complete(true);
            return false; 
        }

        if (event.newWindow) {
            await newTab({ setActive: true, url })
        } else {
            webviewPlugin.loadUrl(tabId, event.url)
            tabs.value[tabId].url = url
        }

        ///browserTabs.saveTabs(tabs)

        event.complete(true);
    });

    webviewPlugin.onPageLoaded(async (dataObj) => {

        //console.log("dataObj===>", dataObj)
        
        let { url = ''} = dataObj
        let tabId = dataObj.webviewId;

        let tab =  tabs.value[tabId] || null 

        if(tab == null) return;

        tab.canGoBack = (await webviewPlugin.canGoBack(tabId))
        tab.canGoForward = (await webviewPlugin.canGoForward(tabId))
        tab.progress = 0;
        
        if(url.trim() != '') {
            tab.url = url
        }

        tabs.value[tabId] = tab
    })
    
    webviewPlugin.onProgress(({ webviewId, value }) => {
        if(webviewId in tabs.value){
            tabs.value[webviewId].progress = value;
        }
    })

    webviewPlugin.onMessage(async (dataObj) => {
        browserCore.processWebMessage({
            webviewPlugin, 
            dataObj,
            permissionModal: permissionModalRef
        });
    });
    
}


const getActiveTab = () => tabs.value[activeTabId.value]

const handleURLChange = async (newUrl) => {
    //console.log("newUrl====>",newUrl)
    //console.log("getActiveTab()===>>>", getActiveTab())
    webviewPlugin.loadUrl(activeTabId.value, newUrl)
}

const openHome = async () => {
    webviewPlugin.loadUrl(activeTabId.value,browserConfig.homepage)
}

const goBack = async () => {
    let t = getActiveTab()
    if(t.canGoBack){
        webviewPlugin.goBack(t.id);
    }
}

const goForward = () => {
    let t = getActiveTab()
    if(t.canGoForward){
        webviewPlugin.goForward(t.id);
    }
}

const reload = () => {
    webviewPlugin.reload(activeTabId.value);
}


const emitWeb3Events = async (eventName, value) => {
    let _tabs = tabs.value
    Object.keys(_tabs).forEach((tabId) => {
        if(webviewPlugin){
            browserCore.emitWeb3Event(webviewPlugin, tabId, eventName, value)
        }
    })
}

const getActiveTabItem = (key, _default) => {
    
    let tId = activeTabId.value
    let _tabs = tabs.value

    if(!tId || !_tabs[tId]) return _default

    return _tabs[tId][key]
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
                :progress="getActiveTabItem('progress', 0)" 
                :url="getActiveTabItem('url', '')"
                ref="addrBarRef"
                @reload="reload"
                @urlChange="handleURLChange"
                @openHome="openHome"
                @inputFocused="(v) => urlInputFocused = v"
                :key="activeTabId"
            />
            <template v-for="tab in tabs">
                <div  
                    :id="tab.id"
                    :class="`tab  ${isBrowserHidden || activeTabId != tab.id ? 't-hidden': ''} `"
                />
            </template>
            <div class="browser-footer">
                <BrowserToolBar 
                    @goBack="goBack"
                    @goFoward="goForward"
                    :totalTabs="Object.keys(tabs).length"
                    :canGoBack="getActiveTabItem('canGoBack', false)"
                    :canGoForward="getActiveTabItem('canGoForward', false)"
                />
            </div>
        </div>

        <PermissionModal 
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
    position: absolute;
    top: 60px;
    z-index: 10;
    display: block;

    &.t-hidden { 
        display: none;
        z-index: 0;
        width: 0px;
        height: 0px;
    }
}

.browser-footer{
    position: absolute;
    bottom: 0px;
    width: 100vw;
}

</style>