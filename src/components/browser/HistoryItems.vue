<script setup>
import { onMounted } from "vue";
import { useBrowserHistory } from "../../composables/useBrowserHistory"
import Image from "../common/Image.vue";
import Utils from "../../classes/Utils";
const { history } = useBrowserHistory()

const p = defineProps({
    limit: { type: Number, default: 100 }
})

const emit = defineEmits(["select"])

const onItemClick = (url) => {
    emit("select", url)
}
</script>
<template>
    <ul v-if="history && history.length > 0" 
        class="list-group list-group-flush browser_history"
    >
        <template v-for="item,index in history">
            <li 
                class="list-group-item no-border py-3"
                v-if="item && typeof item == 'object' && index <= p.limit"
                @click.prevent="onItemClick(url)"
            >   
                <div class="d-flex align-items-start">
                    <Image 
                        :src="Utils.getFaviconURL(item.url, 20)"
                        :placeholder="Utils.parseUrl(item.url).host"
                        :width="20"
                        :height="20"
                        class="rounded-circle item_icon me-1"
                    />
                    <div>
                        <div class="fs-14 fw-semibold ms-1 text-muted text-truncate-multiline">
                            {{ item.title || "" }}
                        </div>
                        <div class="fs-12 fw-medium text-break text-truncate-multiline"
                         style="-webkit-line-clamp: 2; line-clamp: 2;"
                        >
                            {{ Utils.parseUrl(item.url).href }}
                        </div>
                    </div>
                </div>
            </li>
        </template>
    </ul>
</template>
<style lang="scss">
.browser_history {
    .item_icon {
        margin-top: 3.5px !important;
    }
} 
</style>