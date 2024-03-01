<route>
    { name: "browser-tabs" }
</route>

<script>
  export default {
    name: 'browser-tabs'
  }
</script>

<script setup>
import { onActivated, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import Utils from '../../classes/Utils';
import EventBus from '../../classes/EventBus';

const router = useRouter()
const tabs = ref(window.getBrowserTabs())

onBeforeMount(() => initialize())
onActivated(()   => initialize())

const initialize = () => {
    tabs.value = window.getBrowserTabs()
}

const newTab = () => {
    EventBus.emit("newBrowserTab")
    router.go(-1)
}

const switchTab = (tabId) => {
    EventBus.emit("switchBrowserTab", tabId)
    router.go(-1)
}


const deleteTab = (tabId) => {
    EventBus.emit('closeBrowserTab', tabId)
}

onBeforeMount(() => {
    EventBus.on("tabsUpdated", (_tabs) => {
        tabs.value = _tabs
    })
})
</script>
<template>
    <WalletLayout
       title="Browser Tabs"
       :show-nav="true"
       back-url="/browser"
    >   
       <div class="w-800 ps-1 p-2">
            <div class="d-flex flex-wrap">
                <div class="tab-item col-6 p-1">
                    <div class="tab-content border rounded center-vh">
                        <a href="#" class="tab-action new-tab center-vh" 
                            @click.prevent="newTab"
                        >
                            <Icon name="fluent-mdl2:add" :size="24" />
                        </a>
                    </div>
                </div>
                <template v-for="item in tabs">
                    <div class="tab-item col-6 p-1">
                        <div class="tab-content border rounded d-flex flex-column">
                            <div class="tab-header d-flex align-items-center p-1 px-1">
                                <div class="flex-grow-1 text-truncate fs-12 fw-medium pe-1">
                                    {{ item.title }}
                                </div>
                                <a href="#" @click.prevent="deleteTab(item.id)" 
                                    class="text-muted close-btn center-vh"
                                >
                                    <Icon name="mdi:times" :size="20" />
                                </a>
                            </div>
                            <a href="#" class="tab-action flex-grow-1 center-vh" 
                                @click.prevent="switchTab(item.id)"
                            >
                                <div class="d-flex flex-column align-items-center">
                                    <div>
                                        <Image 
                                            :src="Utils.getFaviconURL(item.url, 64)"
                                            :placeholder="Utils.parseUrl(item.url).host"
                                            :width="64"
                                            :height="64"
                                            class="rounded-circle"
                                        />
                                    </div>
                                    <div class="fs-14 mt-2 text-break text-muted">
                                        {{ Utils.parseUrl(item.url).hostname }}
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </template>
            </div>
       </div>
    </WalletLayout>
</template>
<style lang="scss" scoped>
.tab-item {   
    
    .tab-content {
        height:240px !important;
        width: 100% !important;
    }

    .tab-header {
        //height: 20px;
    }
    
    .tab-action {
        width: 100%;

        &:not(.new-tab){
            position: relative;
            top: -20px;
        }
    }

    .close-btn {
        width:  32px !important;
        height: 32px !important;
        padding: 0px !important;
    }
}
</style>