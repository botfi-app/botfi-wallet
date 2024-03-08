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
import { useBrowserTabs } from "../../composables/useBrowserTabs"

const router = useRouter()
const { tabs } = useBrowserTabs();

const newTab = () => {
    EventBus.emit("newBrowserTab")
    router.go(-1)
}

const switchTab = (tabId) => {
    EventBus.emit("switchBrowserTab", tabId)
    router.go(-1)
}


const closeBrowserTab = (tabId) => {

    EventBus.emit('closeBrowserTab', tabId)

    if(Object.keys(tabs.value).length == 1){
        router.go(-1)
    }
}

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
                            <div class="tab-header d-flex space-between align-items-center p-1 px-1">
                                <div class="text-truncate t-title fs-12 fw-medium px-1">
                                    {{ item.title }}
                                </div>
                                <a href="#" @click.prevent="closeBrowserTab(item.id)" 
                                    class="text-muted close-btn center-vh"
                                >
                                    <Icon name="mdi:times" :size="22" />
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
                                            :width="48"
                                            :height="48"
                                            class="rounded-circle"
                                        />
                                    </div>
                                    <div class="fs-14 mt-2 text-break text-muted px-2">
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
        .t-title { width: calc(90%); }
    }
    
    .tab-action {
        width: 100%;
        &.new-tab {
            height: 100%;
        }

        &:not(.new-tab){
            position: relative;
            top: -20px;
        }
    }

    .close-btn {
        width:  32px !important;
        height: 32px !important;
        padding: 0px !important;
        border-radius: 16px;
        position: relative;
        z-index: 100;
        background: var(--bs-body-bg-dark-3) !important;
    }
}
</style>