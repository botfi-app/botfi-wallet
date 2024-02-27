<route>
    { name: "browser-menu" }
</route>

<script>
  export default {
    name: 'browser-menu'
  }
</script>

<script setup>
import { ref } from 'vue';

const menu = ref([
    {
        title: "Connected Sites",
        text: "Manage connected dapps",
        icon: "material-symbols-light:globe",
        url: "/browser/connected-sites"
    },
    /*{
        title: "History",
        text: "Browse previously visited websites",
        icon: "cil:history",
        url: "/browser/history"
    }*/
])
</script>
<template>
    <WalletLayout
       title="Browser Menu"
       :show-nav="true"
       back-url="/browser"
    >   
       <div class="w-800">
            <div class="list-group list-group-flush">
                <template v-for="item in menu">
                    <router-link :to="item.url" 
                        class="list-group-item d-flex justify-content-between align-items-start"
                    >
                        <div class="d-flex align-items-start">
                            <div class="me-2">
                                <Icon :name="item.icon" :size="24" class="text-primary" />
                            </div>
                            <div> 
                                <div  class="fw-semibold text-truncate">
                                    {{ item.title }}
                                </div>
                                <p class="text-muted fs-12">{{ item.text }}</p>
                            </div>
                        </div>
                    </router-link>
                </template>
            </div>
        </div>
    </WalletLayout>
</template>